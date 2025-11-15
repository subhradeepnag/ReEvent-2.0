import { CorrelationMiddleware } from './correlation.middleware'
import { LoggingService } from '../services/logging.service'
import { Request, Response } from 'express'
import * as uuid from 'uuid'

describe('CorrelationMiddleware', () => {
  let middleware: CorrelationMiddleware
  let mockLogger: LoggingService
  let mockRequest: any
  let mockResponse: any
  let mockNext: any

  beforeEach(() => {
    mockLogger = {
      setCorrelation: jest.fn(),
    } as unknown as LoggingService

    middleware = new CorrelationMiddleware(mockLogger)

    mockRequest = {
      headers: {},
    }

    mockResponse = {
      setHeader: jest.fn(),
    }

    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should generate a new correlation and set headers', () => {
    const mockLeaf = 'mock-leaf-uuid'
    jest.spyOn(uuid, 'v4').mockReturnValue(mockLeaf as any)

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

    const expectedCorrelation = { leaf: mockLeaf, root: mockLeaf }

    expect(mockRequest['correlation']).toEqual(expectedCorrelation)
    expect(mockLogger.setCorrelation).toHaveBeenCalledWith(expectedCorrelation)
    expect(mockResponse.setHeader).toHaveBeenCalledWith('orion-correlation-id-leaf', mockLeaf)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should include parent correlation id if provided', () => {
    const mockLeaf = 'mock-leaf-uuid'
    const mockParent = 'mock-parent-id'
    jest.spyOn(uuid, 'v4').mockReturnValue(mockLeaf as any)

    mockRequest.headers['orion-correlation-id-parent'] = mockParent

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

    const expectedCorrelation = {
      leaf: mockLeaf,
      root: mockLeaf,
      parent: mockParent,
    }

    expect(mockRequest['correlation']).toEqual(expectedCorrelation)
    expect(mockLogger.setCorrelation).toHaveBeenCalledWith(expectedCorrelation)
    expect(mockResponse.setHeader).toHaveBeenCalledWith('orion-correlation-id-leaf', mockLeaf)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should use the root correlation id from headers if provided', () => {
    const mockLeaf = 'mock-leaf-uuid'
    const mockRoot = 'mock-root-id'
    jest.spyOn(uuid, 'v4').mockReturnValue(mockLeaf as any)

    mockRequest.headers['orion-correlation-id-root'] = mockRoot

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

    const expectedCorrelation = { leaf: mockLeaf, root: mockRoot }

    expect(mockRequest['correlation']).toEqual(expectedCorrelation)
    expect(mockLogger.setCorrelation).toHaveBeenCalledWith(expectedCorrelation)
    expect(mockResponse.setHeader).toHaveBeenCalledWith('orion-correlation-id-leaf', mockLeaf)
    expect(mockNext).toHaveBeenCalled()
  })
})

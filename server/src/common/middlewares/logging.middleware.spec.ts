import { LoggingMiddleware } from './logging.middleware'
import { LoggingService } from '../services/logging.service'
import { Request, Response } from 'express'

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware
  let mockLogger: LoggingService
  let mockRequest: any
  let mockResponse: any
  let mockNext: any

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
    } as unknown as LoggingService

    middleware = new LoggingMiddleware(mockLogger)

    mockRequest = {
      method: 'GET',
      url: '/test-endpoint',
      body: undefined,
      headers: { authorization: 'Bearer mock.token' },
      query: { search: 'query' },
      params: { id: '123' },
    }

    mockResponse = {
      statusCode: 200,
      send: jest.fn(),
    }

    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log the request details', async () => {
    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockLogger.info).toHaveBeenCalledWith({
      request: {
        method: 'GET',
        url: '/test-endpoint',
        body: undefined,
        query: { search: 'query' },
        params: { id: '123' },
        headers: {
          authorization: 'Bearer mock.REDACTED',
        },
      },
    })
    expect(mockNext).toHaveBeenCalled()
  })

  it('should log the response details when res.send is called', async () => {
    const originalSendSpy = jest.spyOn(mockResponse, 'send')
    const mockResponseBody = { success: true }

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext)

    mockResponse.send(mockResponseBody)

    expect(mockLogger.info).toHaveBeenCalledWith({
      response: {
        status: 200,
        body: mockResponseBody,
      },
    })
    expect(originalSendSpy).toHaveBeenCalledWith(mockResponseBody)
  })
})

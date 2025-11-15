import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { RFC2ExceptionFilter } from './exception.filter'

describe('RFC2ExceptionFilter', () => {
  let exceptionFilter: RFC2ExceptionFilter
  let mockArgumentsHost: ArgumentsHost
  let mockRequest: any
  let mockResponse: any

  beforeEach(() => {
    exceptionFilter = new RFC2ExceptionFilter()

    mockRequest = {
      correlation: { leaf: 'mock-leaf-id' },
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost
  })

  it('should handle generic errors', () => {
    const mockError = new Error('Generic error')

    exceptionFilter.catch(mockError, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 500,
      title: 'Something Went Wrong',
      detail: 'Generic error',
      instance: 'mock-leaf-id',
    })
  })

  it('should handle HttpException with object response', () => {
    const mockHttpException = new HttpException({ title: 'Mock Error', detail: 'Mock detail' }, HttpStatus.BAD_REQUEST)

    exceptionFilter.catch(mockHttpException, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: HttpStatus.BAD_REQUEST,
      title: 'Mock Error',
      detail: 'Mock detail',
      instance: 'mock-leaf-id',
    })
  })

  it('should handle HttpException with string response', () => {
    const mockHttpException = new HttpException('Mock Error Title', HttpStatus.NOT_FOUND)

    exceptionFilter.catch(mockHttpException, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: HttpStatus.NOT_FOUND,
      title: 'Mock Error Title',
      detail: 'Something went wrong',
      instance: 'mock-leaf-id',
    })
  })

  it('should handle unknown exceptions', () => {
    const mockUnknownException = { message: 'Unknown error occurred' }

    exceptionFilter.catch(mockUnknownException, mockArgumentsHost)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 500,
      title: 'Something Went Wrong',
      detail: 'Something Went Wrong',
      instance: 'mock-leaf-id',
    })
  })
})

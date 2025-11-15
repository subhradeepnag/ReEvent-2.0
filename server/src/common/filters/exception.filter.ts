import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Response, Request } from 'express'

@Catch()
export class RFC2ExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>()
    const response = host.switchToHttp().getResponse<Response>()
    let status = 500
    const instance = request.correlation?.leaf
    let errorResponse = {
      status,
      title: 'Something Went Wrong',
      detail: 'Something Went Wrong',
      instance,
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      errorResponse = this.buildErrorResponse(exception, status, instance)
    } else if (exception instanceof Error) {
      errorResponse.detail = exception.message
    }

    response.status(status).json(errorResponse)
  }

  buildErrorResponse(exception: HttpException, status: number, instance: string) {
    const response = exception.getResponse()
    let errorDetails = {
      status,
      title: 'Something went wrong',
      detail: 'Something went wrong',
      instance,
    }

    if (typeof response === 'object') {
      errorDetails = {
        ...errorDetails,
        ...response,
      }
    } else {
      errorDetails.title = response as string
    }

    return errorDetails
  }
}

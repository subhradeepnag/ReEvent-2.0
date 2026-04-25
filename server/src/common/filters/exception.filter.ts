import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class RFC2ExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    let status = 500
    let errorResponse = {
      status,
      title: 'Something Went Wrong',
      detail: 'Something Went Wrong',
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      errorResponse = this.buildErrorResponse(exception, status)
    } else if (exception instanceof Error) {
      errorResponse.detail = exception.message
    }

    response.status(status).json(errorResponse)
  }

  buildErrorResponse(exception: HttpException, status: number) {
    const response = exception.getResponse()
    let errorDetails = {
      status,
      title: 'Something went wrong',
      detail: 'Something went wrong',
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

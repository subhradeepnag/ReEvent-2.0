import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { LoggingService } from '../services/logging.service'

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggingService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { method, url, body, headers, query, params } = req
    this.logger.info({
      request: {
        method,
        url,
        body,
        query,
        params,
        headers: {
          ...headers,
          ...(headers.authorization && {
            authorization: headers.authorization.replace(/[^.]+$/, 'REDACTED'),
          }),
        },
      },
    })

    const originalSend = res.send
    res.send = (responseBody: any) => {
      let logLevel: 'info' | 'warn' | 'error' = 'info'

      if (res.statusCode >= 500) {
        logLevel = 'error'
      } else if (res.statusCode >= 400) {
        logLevel = 'warn'
      }

      this.logger[logLevel]({
        response: {
          status: res.statusCode,
          body: responseBody,
        },
      })
      return originalSend.call(res, responseBody)
    }

    return next()
  }
}

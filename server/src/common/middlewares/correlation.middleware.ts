import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { merge } from 'lodash'
import { LoggingService } from '../services/logging.service'

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggingService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const leaf = uuidv4()
    const parent = req.headers['orion-correlation-id-parent']
    const root = req.headers['orion-correlation-id-root'] || leaf

    const correlation = merge({ leaf, root }, parent && { parent })

    req['correlation'] = correlation

    this.logger.setCorrelation(correlation)

    res.setHeader('orion-correlation-id-leaf', leaf)

    return next()
  }
}

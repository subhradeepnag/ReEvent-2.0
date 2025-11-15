import { Injectable } from '@nestjs/common'
import { LoggerService } from '@nestjs/common'
import * as bunyan from 'bunyan'
import { LogLevel } from 'bunyan'

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: bunyan
  private correlation: any = {}

  constructor() {
    this.logger = bunyan.createLogger({
      name: 'ReEvent',
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    })
  }

  setCorrelation(correlation: any) {
    this.correlation = correlation
  }

  log(message: any) {
    this.logger.info({ message, correlation: this.correlation })
  }

  error(message: any) {
    this.logger.error({ message, correlation: this.correlation })
  }

  warn(message: any) {
    this.logger.warn({ message, correlation: this.correlation })
  }

  debug(message: any) {
    this.logger.debug({ message, correlation: this.correlation })
  }

  verbose(message: any) {
    this.logger.trace({ message, correlation: this.correlation })
  }

  info(message: any) {
    this.logger.info({ message, correlation: this.correlation })
  }
}

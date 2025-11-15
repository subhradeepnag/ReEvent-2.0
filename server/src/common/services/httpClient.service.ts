import { Request } from 'express'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios'
import { merge } from 'lodash'
import { buildMemoryStorage, defaultHeaderInterpreter, setupCache } from 'axios-cache-interceptor'
import { LoggingService } from './logging.service'

const CACHE_TTL = 1 * 60 * 60 * 1000 // 1 hour
const STALE_TTL = 1 * 1000 * 60 // 1 minute
const CLONE_DATA = false
const CLEANUP_INTERVAL = 1 * 1 * 60 * 1000 // 1 minute
const MAX_ENTRIES = 15000

@Injectable()
export class HttpClientService {
  private readonly axiosInstance: AxiosInstance

  constructor(private readonly logger: LoggingService) {
    const cacheOptions = {
      storage: buildMemoryStorage(CLONE_DATA, CLEANUP_INTERVAL, MAX_ENTRIES),
      headerInterpreter: (incomingHeaders: any) => {
        if (incomingHeaders) {
          delete incomingHeaders.etag
          delete incomingHeaders['last-modified']
        }

        let interpretedHeaders = defaultHeaderInterpreter(incomingHeaders)

        if (typeof interpretedHeaders === 'object') {
          interpretedHeaders = {
            ...interpretedHeaders,
            cache: CACHE_TTL,
            stale: STALE_TTL,
          }
        } else {
          interpretedHeaders = {
            cache: CACHE_TTL,
            stale: STALE_TTL,
          }
        }

        return interpretedHeaders
      },
    }

    const axios = Axios.create()
    this.axiosInstance = setupCache(axios, cacheOptions)
  }

  async client(request: Request, options: AxiosRequestConfig): Promise<any> {
    const {
      headers: { authorization },
      correlation: { root, leaf },
    } = request

    this.logger.setCorrelation({ root, leaf })

    this.logger.info({ '=>': { options } })

    const config: AxiosRequestConfig = merge(
      {
        headers: {
          Authorization: `Bearer ${authorization.split(' ')[1]}`,
          'orion-correlation-id-root': root,
          'orion-correlation-id-parent': leaf,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        timeout: 30 * 1000,
      },
      options,
    )

    try {
      const { data: response } = await this.axiosInstance(config)
      this.logger.info({ '<=': { options, response } })
      return response
    } catch (error) {
      const { response, code, message } = error
      const isTimeoutError = code && ['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNABORTED'].includes(code)

      const causes = response?.data ? (typeof response.data === 'object' ? { ...response.data } : { message: response.data }) : []

      const problemDetails = {
        title: isTimeoutError ? 'DownstreamServiceTimeout' : 'DownstreamServiceFailure',
        status: isTimeoutError ? HttpStatus.GATEWAY_TIMEOUT : HttpStatus.BAD_GATEWAY,
        detail: isTimeoutError
          ? 'The request timed out while communicating with the downstream service.'
          : 'The request failed while communicating with the downstream service.',
      }

      this.logger.warn({
        '<=': {
          options,
          problemDetails,
          causes,
          error: {
            status: response?.status || undefined,
            statusText: response?.statusText || undefined,
            message,
          },
        },
      })

      throw new HttpException(problemDetails, problemDetails.status)
    }
  }
}

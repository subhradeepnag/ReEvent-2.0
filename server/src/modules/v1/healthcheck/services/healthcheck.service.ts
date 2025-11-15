import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthcheckService {
  get(): string {
    return 'OK'
  }
}

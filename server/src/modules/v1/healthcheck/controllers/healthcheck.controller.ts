import { Controller, Get } from '@nestjs/common'
import { HealthcheckService } from '../services'

@Controller('api/v1/healthcheck')
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Get()
  get() {
    return this.healthcheckService.get()
  }
}

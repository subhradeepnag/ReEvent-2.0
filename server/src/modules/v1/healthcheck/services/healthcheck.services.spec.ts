import { Test, TestingModule } from '@nestjs/testing'
import { HealthcheckService } from './healthcheck.service'

describe('HealthcheckService', () => {
  let healthcheckService: HealthcheckService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthcheckService],
    }).compile()

    healthcheckService = module.get<HealthcheckService>(HealthcheckService)
  })

  it('should return "OK" when get() is called', () => {
    const result = healthcheckService.get()
    expect(result).toBe('OK')
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { HealthcheckController } from './healthcheck.controller'
import { HealthcheckService } from '../services'

describe('HealthcheckController', () => {
  let healthcheckController: HealthcheckController
  let healthcheckService: HealthcheckService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
      providers: [
        {
          provide: HealthcheckService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    healthcheckController = module.get<HealthcheckController>(HealthcheckController)
    healthcheckService = module.get<HealthcheckService>(HealthcheckService)
  })

  it('should call HealthcheckService.get and return its result', () => {
    const spy = jest.spyOn(healthcheckService, 'get').mockReturnValue('OK')

    const result = healthcheckController.get()

    expect(spy).toHaveBeenCalled()
    expect(result).toBe('OK')
  })
})

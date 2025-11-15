import { Global, Module } from '@nestjs/common'
import * as strategies from './strategies'
import { JwtModule } from '@nestjs/jwt'

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [...Object.values(strategies)],
  exports: [...Object.values(strategies)],
})
export class AuthModule {}

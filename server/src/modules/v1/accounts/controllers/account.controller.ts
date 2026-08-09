import { Body, Controller, Get, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AccountService } from '../services'
import { Request } from 'express'
import { JwtAuthGuard } from '../../../../auth'
import { LoginDto, SignupDto } from '../dto'
import { UpdateProfileDto } from '../dto/update-profile.dto'

@Controller('api/v1/accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUser(@Req() req: Request) {
    const user = req.user as { sub: number; email: string }
    return this.accountService.getUser(user.email)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() body: UpdateProfileDto) {
    const user = req.user as { sub: number; email: string }
    return this.accountService.updateProfile(user.email, body)
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.accountService.signup(body.name, body.phone, body.email, body.password, body.avatar)
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.accountService.validateUser(body.email, body.password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.accountService.login(user)
  }

  @Post('google')
  async googleLogin(@Body('token') token: string) {
    return this.accountService.googleLogin(token)
  }
}

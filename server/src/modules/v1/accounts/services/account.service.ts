import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from '../entities/user.entity'
import * as argon from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client } from 'google-auth-library'

@Injectable()
export class AccountService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async signup(name: string, phone: string, email: string, password: string) {
    const existing = await this.userService.findByEmail(email)
    if (existing) {
      throw new ConflictException('User already exists')
    }
    const user = await this.userService.createUser(name, phone, email, password)
    return await this.login(user)
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      return null
    }
    const isMatch = await argon.verify(user.password, password)
    return isMatch ? user : null
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email }
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '24h',
        secret: 'SUPER-SECRET',
      }),
    }
  }

  async getUser(email: string): Promise<{ id: number; email: string; name: string; phone: string } | null> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      return null
    }
    const userObj = JSON.parse(JSON.stringify(user))
    delete userObj.password

    return userObj
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) throw new UnauthorizedException('Invalid Google token')

    const { email, name, picture } = payload

    let user = await this.userService.findByEmail(email)
    if (!user) {
      user = await this.userService.createGoogleUser(name, email, picture)
    }

    return this.login(user)
  }
}

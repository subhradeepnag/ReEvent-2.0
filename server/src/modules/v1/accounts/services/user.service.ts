import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User } from '../entities'
import * as argon from 'argon2'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ where: { email } })
  }

  async createUser(name: string, phone: string, email: string, password: string, avatar?: string): Promise<User> {
    const hashed = await argon.hash(password)
    const user = await this.userModel.create({ name, phone, email, password: hashed, avatar })
    return user
  }

  async createGoogleUser(name: string, email: string, avatar: string): Promise<User> {
    const user = await this.userModel.create({
      name,
      email,
      avatar,
      isGoogleUser: true,
      password: null,
      phone: null,
    })
    return user
  }
}

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CommonModule } from './common'
import { V1Module } from './modules/v1'
import * as connectionString from 'pg-connection-string'
import { SequelizeModule } from '@nestjs/sequelize'
import { Activity } from './modules/v1/activities/entities'
import { AuthModule } from './auth'
import { User } from './modules/v1/accounts/entities'
import { ActivityAttendee } from './modules/v1/activities/entities/activity-attendee.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string>('DATABASE_URL')
        const dbConfig = connectionString.parse(raw)

        return {
          dialect: 'postgres',
          host: dbConfig.host,
          port: parseInt(dbConfig.port, 10),
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          models: [Activity, User, ActivityAttendee],
          autoLoadModels: true,
          synchronize: true,
        }
      },
      inject: [ConfigService],
    }),
    V1Module,
    CommonModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

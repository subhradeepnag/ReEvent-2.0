import { IsBoolean, IsOptional } from 'class-validator'

export class AddAttendeeDto {
  userId: string

  @IsBoolean()
  @IsOptional()
  isHost?: boolean = false
}

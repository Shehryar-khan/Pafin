import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { emailRegex } from '../../utils/enums/regex';

export class LoginUserDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Matches(emailRegex, { message: `Invalid email` })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  password: string;
}

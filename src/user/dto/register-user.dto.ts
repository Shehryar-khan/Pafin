import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { emailRegex, passwordRegEx } from '../../utils/enums/regex';
import { RESPONSE_MESSAGE } from '../../utils/enums/response.messages';

export class RegisterUserDTO {
  @ApiProperty()
  @IsString()
  @MinLength(2, { message: RESPONSE_MESSAGE.MIN_CHARACTERS })
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Matches(emailRegex, { message: RESPONSE_MESSAGE.INVALID_EMAIL })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: RESPONSE_MESSAGE.PASSWORD_ERRORS,
  })
  password: string;
}

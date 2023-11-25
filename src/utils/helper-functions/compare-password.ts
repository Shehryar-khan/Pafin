import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entities/user.entity';

export const passwordMatch = (loginDto: LoginUserDTO, user: User) => {
  if (bcrypt.compareSync(loginDto.password, user.password)) {
    return true;
  }
  return false;
};

import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

export const passwordMatch = (dto, user: User) => {
  return bcrypt.compareSync(dto.password, user.password) ? true : false;
  // if (bcrypt.compareSync(dto.password, user.password)) {
  //   return true;
  // }
  // return false;
};

import * as jwt from 'jsonwebtoken';
import { User } from '../../user/entities/user.entity';

export const generateJwtToken = (user: User) => {
  const jwtObj: object = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  return jwt.sign(
    {
      ...jwtObj,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME,
    },
  );
};

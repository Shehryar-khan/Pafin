import * as bcrypt from 'bcrypt';

export const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 10);
};

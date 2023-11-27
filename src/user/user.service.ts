import { HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RESPONSE_MESSAGE } from '../utils/enums/response.messages';
import { generateJwtToken } from '../utils/helper-functions/generate-jwt';
import { maskPassword } from '../utils/helper-functions/mask-password';
import { hashPassword } from '../utils/helper-functions/hash-password';
import { passwordMatch } from '../utils/helper-functions/compare-password';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private UserModel: Repository<User>) {}

  /**
   *
   * @param userRegister
   * @param request
   * @param response
   * @returns Success Response
   */
  async requestRegisterUser(
    userRegister: RegisterUserDTO,
    request: Request,
    response: Response,
  ): Promise<User | any> {
    try {
      const ifExist = await this.UserModel.findOne({
        where: { email: userRegister.email },
      });
      // checking if email already exist
      if (ifExist) {
        return response.status(HttpStatus.CONFLICT).json({
          code: HttpStatus.CONFLICT,
          message: RESPONSE_MESSAGE.EMAIL_ALREADY_REGISTERED,
        });
      }

      const user = new User();
      Object.assign(user, userRegister);
      user.password = hashPassword(userRegister.password);
      await this.UserModel.save(user);

      maskPassword(user.password);
      return response.status(HttpStatus.CREATED).json({
        code: HttpStatus.CREATED,
        message: RESPONSE_MESSAGE.USER_REGISTERED,
      });
    } catch (error) {
      console.log(error);
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: error?.message,
        error,
      });
    }
  } // end of function

  /**
   *
   * @param userLogin
   * @param request
   * @param response
   * @returns token, current user's detail
   */
  async requestLoginUser(
    userLogin: LoginUserDTO,
    request: Request,
    response: Response,
  ) {
    try {
      const user = await this.UserModel.findOne({
        where: { email: userLogin.email },
      });

      // checking if user exist
      if (!user) {
        return response.status(HttpStatus.NOT_FOUND).json({
          code: HttpStatus.NOT_FOUND,
          message: RESPONSE_MESSAGE.USER_NOT_FOUND,
        });
      }

      // comparing passwords
      const isValidPass = passwordMatch(userLogin, user);
      if (!isValidPass) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          code: HttpStatus.BAD_REQUEST,
          message: RESPONSE_MESSAGE.INCORRECT_PASSWORD,
        });
      }
      // generating jwt token
      const token = generateJwtToken(user);
      const maskedValue = maskPassword(user.password);

      return response.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        message: RESPONSE_MESSAGE.USER_LOGIN,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: maskedValue,
        },
      });
    } catch (error) {
      console.log('error is ==>', error.message);
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: error?.message,
        error,
      });
    }
  } // end of function

  /**
   *
   * @param updateUserDto
   * @param request
   * @param response
   */
  async updateUser(
    updateUserDto: UpdateUserDTO,
    user: User,
    request: Request,
    response: Response,
  ) {
    try {
      //if the fields are empty , return don't make any db queries
      console.log('user-id ==>', user.id);
      if (
        !updateUserDto.email &&
        !updateUserDto.name &&
        !updateUserDto.password
      ) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          code: HttpStatus.BAD_REQUEST,
          message: RESPONSE_MESSAGE.NO_DATA_TO_UPDATE,
        });
      }
      const userInDB = await this.UserModel.findOne({
        where: { id: user.id },
      });
      console.log('userInDB =>', userInDB);

      //If no user exist with the incoming Id return not found error
      if (!userInDB) {
        return response.status(HttpStatus.NOT_FOUND).json({
          code: HttpStatus.NOT_FOUND,
          message: RESPONSE_MESSAGE.USER_NOT_FOUND,
        });
      }
      /*If the data does not belong to the current user return not allowed error
        User can only update own data
        Above database query won't give other person's data , Just to add the extra security this if check has been implemented
        Would be better in the scenario when id is coming from the parameters
      */
      if (userInDB.id !== user.id) {
        return response.status(HttpStatus.METHOD_NOT_ALLOWED).json({
          code: HttpStatus.METHOD_NOT_ALLOWED,
          message: RESPONSE_MESSAGE.NOT_ALLOWED_TO_EDIT,
        });
      }

      //If user is trying to update the email,Make sure the given email does not exist for any other user
      if (updateUserDto.email) {
        const emailExist = await this.UserModel.findOne({
          where: {
            email: updateUserDto.email,
            id: Not(user.id),
          },
        });
        if (emailExist) {
          return response.status(HttpStatus.CONFLICT).json({
            code: HttpStatus.CONFLICT,
            message: RESPONSE_MESSAGE.EMAIL_ALREADY_REGISTERED,
          });
        }
      }

      Object.assign(userInDB, updateUserDto);
      if (updateUserDto.password) {
        userInDB.password = hashPassword(updateUserDto.password);
      }
      await this.UserModel.update({ id: user.id }, userInDB);

      return response.status(HttpStatus.ACCEPTED).json({
        code: HttpStatus.ACCEPTED,
        message: RESPONSE_MESSAGE.USER_UPDATED,
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: error?.message,
        error,
      });
    }
  }

  /**
   *
   * @param id
   * @param user
   * @param request
   * @param response
   * @returns
   */
  async deleteUser(
    id: string,
    user: User,
    request: Request,
    response: Response,
  ) {
    try {
      // Id user has entered and user's own id must match , user can not delete another user.Just himself
      console.log('here', id, 'user id', user.id);

      if (id != user.id) {
        return response.status(HttpStatus.METHOD_NOT_ALLOWED).json({
          code: HttpStatus.METHOD_NOT_ALLOWED,
          message: RESPONSE_MESSAGE.NOT_ALLOWED_TO_DELETE,
        });
      }

      /*
       This is kind of a useless query for now because it the user himself who is sending his id
       Helpful when there is other related to the user or the provided id
       */
      const userExist = await this.UserModel.findOne({
        where: {
          id: id,
        },
      });

      if (!userExist) {
        return response.status(HttpStatus.NOT_FOUND).json({
          code: HttpStatus.NOT_FOUND,
          message: RESPONSE_MESSAGE.USER_NOT_FOUND,
        });
      }
      console.log('then here');
      await this.UserModel.delete({ id: id });

      return response.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        message: RESPONSE_MESSAGE.USER_DELETED,
      });
    } catch (error) {
      console.log('this is the error =>', error.message);
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: error?.message,
        error,
      });
    }
  }
}

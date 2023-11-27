// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { hashPassword } from '../utils/helper-functions/hash-password';
import { RESPONSE_MESSAGE } from '../utils/enums/response.messages';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as generateJwtUtils from '../utils/helper-functions/generate-jwt';
import { maskPassword } from '../utils/helper-functions/mask-password';
import { UpdateResult } from 'typeorm';
import { TEST_CASE_DATA } from '../utils/enums/test.case.data';


describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const request = {} as unknown as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  //Register User Test Cases
  describe('requestRegisterUser', () => {
    //Register user Successfully
    it('should register a user successfully', async () => {
      const registerUserDto: RegisterUserDTO = {
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation((user) => Promise.resolve(user as User));

      await userService.requestRegisterUser(
        registerUserDto,
        request as Request,
        response as Response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.CREATED,
        message: RESPONSE_MESSAGE.USER_REGISTERED,
      });
    });

    //If Email address already exist
    it('should return conflict status if user already exists', async () => {
      const registerUserDto: RegisterUserDTO = {
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({} as User);

      await userService.requestRegisterUser(
        registerUserDto,
        request as Request,
        response as Response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.CONFLICT,
        message: RESPONSE_MESSAGE.EMAIL_ALREADY_REGISTERED,
      });
    });
  });

  //Login Test Cases
  describe('requestLoginUser', () => {
    //Login Ok
    it('should login user successfully with correct details', async () => {
      const loginUserDto: LoginUserDTO = {
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };

      const user: User = {
        id: TEST_CASE_DATA.UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: hashPassword(TEST_CASE_DATA.PASSWORD),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(generateJwtUtils, 'generateJwtToken')
        .mockReturnValue('mockedToken');

      await userService.requestLoginUser(
        loginUserDto,
        request as Request,
        response as Response,
      );

      const maskedPassword = maskPassword(hashPassword('correctPassword'));
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.OK,
        message: RESPONSE_MESSAGE.USER_LOGIN,
        token: 'mockedToken',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: maskedPassword,
        },
      });
    });

    // If email does not exist
    it('should return user found status if user does not exist while login', async () => {
      const loginUserDto: LoginUserDTO = {
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await userService.requestLoginUser(
        loginUserDto,
        request as Request,
        response as Response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.NOT_FOUND,
        message: RESPONSE_MESSAGE.USER_NOT_FOUND,
      });
    });
  });

  //update user unit tests
  describe('updateUser', () => {
    it('should return no data to update if fields are empty while updating', async () => {
      const updateUserDto: UpdateUserDTO = {
        name: '',
        email: '',
        password: '',
      };
      const user: User = {
        id: TEST_CASE_DATA.UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };
      await userService.updateUser(
        updateUserDto,
        user,
        request as Request,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.BAD_REQUEST,
        message: RESPONSE_MESSAGE.NO_DATA_TO_UPDATE,
      });
    });

    //If data does not exist when updating
    it('should return user not found if data does not exist while updating', async () => {
      const updateUserDto: UpdateUserDTO = {
        email: TEST_CASE_DATA.EMAIL,
        name: TEST_CASE_DATA.NAME,
        password: TEST_CASE_DATA.PASSWORD,
      };
      const user: User = {
        id: TEST_CASE_DATA.UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };
      jest.spyOn(userService['UserModel'], 'findOne').mockResolvedValue(null);
      await userService.updateUser(
        updateUserDto,
        user,
        request as Request,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.NOT_FOUND,
        message: RESPONSE_MESSAGE.USER_NOT_FOUND,
      });
    });

    // When updating other user data user enters an email which belongs to another user
    it('should return method not allowed status if updating data that does not belong to the user', async () => {
      const updateUserDto: UpdateUserDTO = {
        email: TEST_CASE_DATA.NEW_EMAIL,
        name: TEST_CASE_DATA.NAME,
        password: TEST_CASE_DATA.PASSWORD,
      };
      const user: User = {
        id: TEST_CASE_DATA.ID_1,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };
      jest.spyOn(userService['UserModel'], 'findOne').mockResolvedValue({
        id: TEST_CASE_DATA.ID_2,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.NEW_EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      });
      await userService.updateUser(
        updateUserDto,
        user,
        request as Request,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.METHOD_NOT_ALLOWED,
      );
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.METHOD_NOT_ALLOWED,
        message: RESPONSE_MESSAGE.NOT_ALLOWED_TO_EDIT,
      });
    });

    // Email already registered when updating the email which belongs to another user
    it('should return email already exist if the email user is trying to update belongs to some other user', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
        email: TEST_CASE_DATA.LOGGED_IN_USER_EMAIL,
      };
      const updateUserDto = {
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.NEW_PASSWORD
      };
      const existingUserWithEmail = {
        id: TEST_CASE_DATA.ANOTHER_UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EXISTING_EMAIL,
        password: TEST_CASE_DATA.NEW_PASSWORD,
      };
      jest
        .spyOn(userService['UserModel'], 'findOne')
        .mockResolvedValue(existingUserWithEmail);
      try {
        await userService.updateUser(
          updateUserDto,
          loggedInUser as any,
          request as Request,
          response as Response,
        );
      } catch (error) {
        expect(error.status).toEqual(HttpStatus.CONFLICT);
        expect(error.message).toEqual(
          RESPONSE_MESSAGE.EMAIL_ALREADY_REGISTERED,
        );
      }
    });

    // User update successfully without email
    it('should update user successfully when email not is provided to update', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
        email: TEST_CASE_DATA.LOGGED_IN_USER_EMAIL,
      };
      const updateUserDto = {
        name: TEST_CASE_DATA.NAME,
        email: '',
        password: TEST_CASE_DATA.NEW_PASSWORD,
      };
      const userToUpdate = {
        id: TEST_CASE_DATA.UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };
      jest
        .spyOn(userService['UserModel'], 'findOne')
        .mockResolvedValue(userToUpdate);
      jest
        .spyOn(userService['UserModel'], 'update')
        .mockResolvedValue({} as UpdateResult);
      await userService.updateUser(
        updateUserDto,
        loggedInUser as any,
        request as Request,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.ACCEPTED,
        message: RESPONSE_MESSAGE.USER_UPDATED,
      });
    });

    // Update user
    it('should update user successfully when email is provided to update', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
        email: TEST_CASE_DATA.EMAIL,
      };

      const updateUserDto = {
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.NEW_PASSWORD,
      };

      const userToUpdate = {
        id: TEST_CASE_DATA.UUID,
        name: TEST_CASE_DATA.NAME,
        email: TEST_CASE_DATA.EMAIL,
        password: TEST_CASE_DATA.PASSWORD,
      };

      // Mocking findOne to return the user being updated
      jest
        .spyOn(userService['UserModel'], 'findOne')
        .mockResolvedValue(userToUpdate);
      jest
        .spyOn(userService['UserModel'], 'update')
        .mockResolvedValue({} as UpdateResult);

      await userService.updateUser(
        updateUserDto,
        loggedInUser as any,
        request as Request,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.ACCEPTED,
        message: RESPONSE_MESSAGE.USER_UPDATED,
      });
    });
  });

  // delete unit tests
  describe('deleteUser', () => {
    // When the user provided id and user's own id does not match
    it('should not allow deleting if the provided id does not match the logged-in user id', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
      };
      const userIdToDelete = TEST_CASE_DATA.ANOTHER_UUID;
      await userService.deleteUser(
        userIdToDelete,
        loggedInUser as any,
        request,
        response,
      );
      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.METHOD_NOT_ALLOWED,
      );
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.METHOD_NOT_ALLOWED,
        message: RESPONSE_MESSAGE.NOT_ALLOWED_TO_DELETE,
      });
    });

    // When no data exist for the id which user wants to update
    it('should return not found if the provided id has no corresponding data in the database while deleting', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
      };
      const userIdToDelete = TEST_CASE_DATA.UUID;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await userService.deleteUser(
        userIdToDelete,
        loggedInUser as any,
        request,
        response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.NOT_FOUND,
        message: RESPONSE_MESSAGE.USER_NOT_FOUND,
      });
    });

    // User should be deleted
    it('should delete the user if the provided id matches the logged-in user id and exists in the database', async () => {
      const loggedInUser = {
        id: TEST_CASE_DATA.UUID,
      };
      const userIdToDelete = TEST_CASE_DATA.UUID;
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(loggedInUser.id as any);
      jest
        .spyOn(userService['UserModel'], 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      await userService.deleteUser(
        userIdToDelete,
        loggedInUser as any,
        request,
        response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        code: HttpStatus.OK,
        message: RESPONSE_MESSAGE.USER_DELETED,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

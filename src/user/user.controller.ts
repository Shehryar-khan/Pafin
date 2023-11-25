import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserAuthenticationGuard } from '../authentication/user.guard'
import {
  ApiHeader,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   *
   * @param userRegister
   * @param req
   * @param res
   * @returns
   */
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({
    status: 200,
    description: 'Registered Successfully',
  })

  @Post('register')
  async requestRegisterUser(
    @Body() userRegister: RegisterUserDTO,
    @Request() req,
    @Response() res,
  ) {
    return this.userService.requestRegisterUser(userRegister, req, res);
  }

  /**
   *
   * @param userLogin
   * @param req
   * @param res
   * @returns
   */
  @ApiOperation({ summary: 'Login/Fetch User' })
  @ApiResponse({
    status: 200,
    description: 'Login Successfully',
  })

  @Post('login')
  async requestLoginUser(
    @Body() userLogin: LoginUserDTO,
    @Request() req,
    @Response() res,
  ) {
    return this.userService.requestLoginUser(userLogin, req, res);
  }

  /**
   *
   * @param userUpdate
   * @param req
   * @param res
   * @returns
   */
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({
    status: 200,
    description: 'Updated Successfully',
  })

  @UseGuards(UserAuthenticationGuard)
  @Put('update')
  async updateUser(
    @GetUser() user: User,
    @Body() userUpdate: UpdateUserDTO,
    @Request() req,
    @Response() res,
  ) {
    return this.userService.updateUser(userUpdate,user, req, res);
  }



  /**
   *
   * @param userUpdate
   * @param req
   * @param res
   * @returns
   */
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({
    status: 200,
    description: 'Updated Successfully',
  })

  @UseGuards(UserAuthenticationGuard)
  @Delete('delete')
  async deleteUser(
    @GetUser() user: User,
    @Body() userUpdate: UpdateUserDTO,
    @Request() req,
    @Response() res,
  ) {
    return this.userService.updateUser(userUpdate,user, req, res);
  }

  
}

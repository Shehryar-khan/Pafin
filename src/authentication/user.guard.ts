import { CanActivate, ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { User } from '../user/entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RESPONSE_MESSAGE } from 'src/utils/enums/response.messages'
import { log } from 'console'


@Injectable()
export class UserAuthenticationGuard implements CanActivate {
	constructor(@InjectRepository(User) private readonly UserModel: Repository<User>) {}

	async canActivate(context: ExecutionContext) {
		const req: any = context.switchToHttp().getRequest()

		// Checking if token existss
		const token = req.headers.authorization || req.headers.jwt
        console.log("Token ==>" , token)
		if (!token) {
			throw new UnauthorizedException()
		}
		try {
			const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            console.log("Decoded Token =>" , decodedToken);
            
			const user: User = await this.UserModel.findOne({
				where: {
					email: decodedToken['email'],
				},
			})
            console.log("Guard =>" , user);
			if (!user) {
				throw new Error(RESPONSE_MESSAGE.USER_NOT_FOUND)
			}
            console.log("Guard =>" , user);
            
			req['user'] = { ...user }
			return true
		} catch (error) {
			let message = error.message
			throw new UnauthorizedException(
				{
					code: HttpStatus.UNAUTHORIZED,
					message,
				},
				message
			)
		}
	}
}
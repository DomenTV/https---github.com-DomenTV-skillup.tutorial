import { BadRequestException, Injectable } from '@nestjs/common'
import { UsersService } from 'modules/users/users.service'
import { JwtService } from '@nestjs/jwt'
import Logging from 'library/Logging'
import { compareHash } from 'utils/bcrypt'
import { User } from 'entities/user.entity'
import { RegisterUserDto } from './dto/register-user.dto'
import { hash } from 'utils/bcrypt'
import { Request, RequestHandler } from 'express'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User> {
    Logging.info('Validating user...')
    const user = await this.usersService.findBy({ email: email })
    if (!user) {
      //throw new BadRequestException(`pass1: ${password}`)
      //console.log("User no exist")
      throw new BadRequestException('Invalid credentials')
    }
    //console.log(`pass ${password} userp ${user.passport}`)
    if (!(await compareHash(password, user.password))) {
      //throw new BadRequestException(`pass2: ${password}`)
      //console.log("Compare was done")
      throw new BadRequestException('Invalid credentials')
    }
    Logging.info('user is valid')
    //console.log("user is valid")
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await hash(registerUserDto.password)
    //throw new BadRequestException(`So like ${registerUserDto.confirm_password}`) was testing cuz no working
    return this.usersService.create({
      role_id: null,
      ...registerUserDto,
      password: hashedPassword,
    })
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({sub:user.id, name: user.email})
  }

  async user(cookie: string): Promise<User> {
    const data = await this.jwtService.verifyAsync(cookie)
    return this.usersService.findById(data['id'])
  }

  async getUserId(request: Request): Promise<string> {
    const user = request.user as User
    return user.id
  }
}

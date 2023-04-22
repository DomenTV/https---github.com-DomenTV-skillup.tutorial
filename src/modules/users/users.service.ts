import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AbstractService } from 'modules/common/abstract.service'
import { User } from 'entities/user.entity'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import Logging from 'library/Logging'
import { UpdateUserDto } from './dto/update-user.dto'
import { compareHash, hash } from 'utils/bcrypt'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'

@Injectable()
export class UsersService extends AbstractService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    //throw new BadRequestException(`I GOT HERE!! ${createUserDto.email}`)
    var user
    try {
      user = await this.findBy({ email: createUserDto.email })
    } catch (error) {
      //user = false;
      //throw new BadRequestException(error)
    }

    //throw new BadRequestException('I GOT HERE!!')
    if (user) {
      throw new BadRequestException('User with that email already exists.')
    }
    try {
      //throw new BadRequestException('I GOT HERE (NOT SAVED)')
      const newUser = this.usersRepository.create({ ...createUserDto })
      //throw new BadRequestException('I GOT HERE (NOT SAVED)')
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating new user (users.service)')
    }
  }

  async update(id: string, UpdateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, role_id, ...data } = UpdateUserDto
    if (user.email !== email && email) {
      user.email = email
    }
    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(password)
    }
    if (role_id) {
      //user.role = {...user.role, id: role_id}
    }
    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })
      return this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user')
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  EntityManager,
  EntityNotFoundError,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import Encript from 'src/utils/encryption';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = new User(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('User Already Exist');
        }
      }
      throw error;
    }
  }

  matchPassword(enteredPassword: string, currentPassword: string) {
    return Encript.compare(enteredPassword, currentPassword);
  }

  async findAllPaginate(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const pageDetail = {
        page: page,
        limit: limit,
        totalPage: 0,
        list: [] as User[],
      };
      const [list, totalData] = await Promise.all([
        this.userRepository.find({
          skip,
          take: limit,
        }),
        this.userRepository.count(),
      ]);

      pageDetail.list = list;
      pageDetail.totalPage = Math.ceil(totalData / limit);

      return pageDetail;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException('User Not Found');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      user.email = updateUserDto.email;
      user.username = updateUserDto.username;
      user.password = updateUserDto.password;
      return await this.entityManager.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('User Already Exist');
        }
      }
      if (error instanceof EntityNotFoundError) {
        if (error.message.includes('Could not find any entity of type')) {
          throw new NotFoundException('User Not Found');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const deletedUser = await this.userRepository.delete(id);
    if (deletedUser.affected <= 0) {
      throw new NotFoundException('User Not Found');
    }
    return { message: 'user has been deleted' };
  }
}

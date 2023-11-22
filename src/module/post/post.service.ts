import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      return await this.postRepository.save(createPostDto);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('Duplicate entry')
      ) {
        throw new ConflictException('User Already Exist');
      }
      throw error;
    }
  }

  async findAllPaginate(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const pageDetail = {
        page: page,
        limit: limit,
        totalPage: 0,
        list: [] as Post[],
      };
      const [list, totalData] = await Promise.all([
        this.postRepository.find({
          skip,
          take: limit,
        }),
        this.postRepository.count(),
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
      return await this.postRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException('Post Not Found');
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const user = await this.postRepository.findOneByOrFail({ id });
      user.content = updatePostDto.content;
      return await this.entityManager.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('Duplicate entry')
      ) {
        throw new ConflictException('User Already Exist');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const deletedUser = await this.postRepository.delete(id);
    if (deletedUser.affected <= 0) {
      throw new NotFoundException('Post Not Found');
    }
    return deletedUser;
  }
}

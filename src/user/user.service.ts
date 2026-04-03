import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { GenericService } from '../common/services/generic.service';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class UserService extends GenericService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async create(dto: DeepPartial<User>): Promise<User> {
    const userData: DeepPartial<User> = { ...dto };

    if (typeof userData.password === 'string' && !userData.salt) {
      userData.salt = await genSalt();
      userData.password = await hash(userData.password, userData.salt);
    }

    return super.create(userData);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}

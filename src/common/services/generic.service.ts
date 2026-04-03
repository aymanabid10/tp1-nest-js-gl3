import { Injectable } from '@nestjs/common';
import { Repository, DeepPartial, ObjectLiteral } from 'typeorm';

@Injectable()
export class GenericService<T extends ObjectLiteral> {
  constructor(private readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repository.findAndCount({ skip, take: limit });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, dto: DeepPartial<T>): Promise<T | null> {
    return Promise.resolve(null);
  }

  remove(id: number): Promise<void> {
    return Promise.resolve();
  }
}

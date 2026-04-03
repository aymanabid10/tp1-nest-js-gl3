import { Injectable } from '@nestjs/common';
import { Repository, DeepPartial, ObjectLiteral } from 'typeorm';

@Injectable()
export class GenericService<T extends ObjectLiteral> {
  constructor(private readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll(): Promise<T[]> {
    return Promise.resolve([]);
  }

  findOne(id: number): Promise<T | null> {
    return Promise.resolve(null);
  }

  update(id: number, dto: DeepPartial<T>): Promise<T | null> {
    return Promise.resolve(null);
  }

  remove(id: number): Promise<void> {
    return Promise.resolve();
  }
}

import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  ObjectLiteral,
  FindOptionsWhere,
} from 'typeorm';

@Injectable()
export class GenericService<T extends ObjectLiteral & { id: number }> {
  constructor(private readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll(): Promise<T[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<T | null> {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async update(id: number, dto: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findOne(id);
    if (!entity) {
      return null;
    }

    const merged = this.repository.merge(entity, dto);
    return this.repository.save(merged);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

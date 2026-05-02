import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  ObjectLiteral,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { PaginatedResult } from '../dto/pagination.dto';

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

  async findAllPaginated(
    page = 1,
    limit = 10,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const normalizedPage = Math.max(1, Math.trunc(page));
    const normalizedLimit = Math.max(1, Math.trunc(limit));

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    return {
      data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.ceil(total / normalizedLimit),
    };
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
    await this.repository.softDelete(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, ObjectLiteral } from 'typeorm';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class GenericService<T extends ObjectLiteral> {
  constructor(private readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<{ data: T }> {
    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);
    return { data: saved };
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<T>> {
    return paginate<T>(this.repository, options);
  }

  async findOne(id: number): Promise<{ data: T }> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return { data: entity };
  }

  async findOneBy(criteria: Partial<T>): Promise<{ data: T }> {
    const entity = await this.repository.findOne({ where: criteria as any });
    if (!entity) {
      throw new NotFoundException(`Entity not found with given criteria`);
    }
    return { data: entity };
  }

  async update(id: number, dto: DeepPartial<T>): Promise<{ data: T }> {
    const result = await this.repository.findOne({ where: { id } as any });
    if (!result) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    Object.assign(result, dto);
    const updated = await this.repository.save(result);
    return { data: updated };
  }

  async remove(criteria: Partial<T>): Promise<{ affected: number }> {
    const result = await this.repository.softDelete(criteria as any);
    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Entity not found`);
    }
    return { affected: result.affected };
  }
}

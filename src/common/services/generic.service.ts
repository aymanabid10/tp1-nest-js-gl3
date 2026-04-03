import { Injectable } from '@nestjs/common';
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

  async findOne(id: number): Promise<{ data: T | null }> {
    const entity = await this.repository.findOne({ where: { id } as any });
    return { data: entity };
  }

  async update(id: number, dto: DeepPartial<T>): Promise<{ data: T | null }> {
    const result = await this.findOne(id);
    if (!result.data) return { data: null };
    Object.assign(result.data, dto);
    const updated = await this.repository.save(result.data);
    return { data: updated };
  }

  async remove(criteria: Partial<T>): Promise<{ success: boolean; affected: number }> {
    const result = await this.repository.softDelete(criteria as any);
    return { success: true, affected: result.affected || 0 };
  }
}

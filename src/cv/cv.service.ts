import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericService } from '../common/services/generic.service';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class CvService extends GenericService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {
    super(cvRepository);
  }

  async create(createCvDto: CreateCvDto): Promise<{ data: Cv }> {
    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: createCvDto.userId },
      skills: createCvDto.skillIds?.map((id) => ({ id })) ?? [],
    });
    const saved = await this.cvRepository.save(cv);
    return { data: saved };
  }

  async findAllByUser(userId: number, options: IPaginationOptions) {
    const queryBuilder = this.cvRepository.createQueryBuilder('cv')
      .where('cv.userId = :userId', { userId });
    return paginate(queryBuilder, options);
  }

  async findOneByUser(id: number, userId: number): Promise<{ data: Cv | null }> {
    const cv = await this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
    return { data: cv };
  }

  async updateByUser(id: number, userId: number, updateCvDto: UpdateCvDto): Promise<{ data: Cv | null }> {
    const result = await this.findOneByUser(id, userId);
    if (!result.data) return { data: null };
    
    Object.assign(result.data, {
      ...updateCvDto,
      skills: updateCvDto.skillIds?.map((skillId) => ({ id: skillId })) ?? result.data.skills,
    });
    
    const updated = await this.cvRepository.save(result.data);
    return { data: updated };
  }

  async removeByUser(id: number, userId: number): Promise<{ success: boolean }> {
    const result = await this.findOneByUser(id, userId);
    if (!result.data) return { success: false };
    await this.cvRepository.softDelete(id);
    return { success: true };
  }
}

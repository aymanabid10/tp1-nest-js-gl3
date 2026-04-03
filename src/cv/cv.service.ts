import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneByUser(id: number, userId: number): Promise<{ data: Cv }> {
    const cv = await this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found for this user`);
    }
    return { data: cv };
  }

  async updateByUser(id: number, userId: number, updateCvDto: UpdateCvDto): Promise<{ data: Cv }> {
    const result = await this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!result) {
      throw new NotFoundException(`CV with id ${id} not found for this user`);
    }
    
    Object.assign(result, {
      ...updateCvDto,
      skills: updateCvDto.skillIds?.map((skillId) => ({ id: skillId })) ?? result.skills,
    });
    
    const updated = await this.cvRepository.save(result);
    return { data: updated };
  }

  async removeByUser(id: number, userId: number): Promise<{ affected: number }> {
    const cv = await this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found for this user`);
    }
    await this.cvRepository.softDelete(id);
    return { affected: 1 };
  }
}

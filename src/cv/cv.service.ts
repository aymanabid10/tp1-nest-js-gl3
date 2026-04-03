import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericService } from '../common/services/generic.service';

@Injectable()
export class CvService extends GenericService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {
    super(cvRepository);
  }

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: createCvDto.userId },
      skills: createCvDto.skillIds?.map((id) => ({ id })) ?? [],
    });
    return this.cvRepository.save(cv);
  }

  async findAllByUser(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.cvRepository.findAndCount({
      where: { user: { id: userId } },
      skip,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneByUser(id: number, userId: number): Promise<Cv | null> {
    return this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async updateByUser(id: number, userId: number, updateCvDto: UpdateCvDto): Promise<Cv | null> {
    const cv = await this.findOneByUser(id, userId);
    if (!cv) return null;
    
    Object.assign(cv, {
      ...updateCvDto,
      skills: updateCvDto.skillIds?.map((skillId) => ({ id: skillId })) ?? cv.skills,
    });
    
    return this.cvRepository.save(cv);
  }

  async removeByUser(id: number, userId: number): Promise<boolean> {
    const cv = await this.findOneByUser(id, userId);
    if (!cv) return false;
    await this.cvRepository.softDelete(id);
    return true;
  }
}

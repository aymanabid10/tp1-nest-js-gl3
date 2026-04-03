import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { GenericService } from '../common/services/generic.service';
import { UpdateCvDto } from './dto/update-cv.dto';

@Injectable()
export class CvService extends GenericService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {
    super(cvRepository);
  }

  async create(createCvDto: CreateCvDto & { userId: number }): Promise<Cv> {
    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: createCvDto.userId },
      skills: createCvDto.skillIds?.map((id) => ({ id })) ?? [],
    });
    return this.cvRepository.save(cv);
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({ where: { id } });

    if (!cv) {
      throw new NotFoundException(`Cv with id ${id} not found`);
    }

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id);
    const { skillIds, ...cvData } = updateCvDto;

    Object.assign(cv, cvData);

    if (skillIds !== undefined) {
      cv.skills = skillIds.map((skillId) => ({ id: skillId })) as Cv['skills'];
    }

    return this.cvRepository.save(cv);
  }

  async remove(id: number): Promise<void> {
    const cv = await this.findOne(id);
    await this.cvRepository.remove(cv);
  }
}

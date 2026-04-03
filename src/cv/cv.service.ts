import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
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
}

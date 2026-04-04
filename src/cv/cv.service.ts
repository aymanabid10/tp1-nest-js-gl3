import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayloadInterface } from 'src/auth/interface/payload.interface';
import { Role } from 'src/shared/enums/role.enum';
import { Skill } from 'src/skill/entities/skill.entity';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
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

  async createForOwner(createCvDto: CreateCvDto, ownerId: number): Promise<Cv> {
    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: ownerId },
      skills: createCvDto.skillIds?.map((id) => ({ id })) ?? [],
    });

    return this.cvRepository.save(cv);
  }

  findAllForAdmin(): Promise<Cv[]> {
    return this.cvRepository.find();
  }

  findAllForUser(user: PayloadInterface): Promise<Cv[]> {
    if (user.role === Role.ADMIN) {
      return this.findAllForAdmin();
    }

    return this.cvRepository.find({ where: { user: { id: user.sub } } });
  }

  async findAllForUserPaginated(
    user: PayloadInterface,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Cv>> {
    const normalizedPage = Math.max(1, Math.trunc(page));
    const normalizedLimit = Math.max(1, Math.trunc(limit));

    const [data, total] =
      user.role === Role.ADMIN
        ? await this.cvRepository.findAndCount({
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
          })
        : await this.cvRepository.findAndCount({
            where: { user: { id: user.sub } },
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

  async findOneForUser(id: number, user: PayloadInterface): Promise<Cv> {
    const cv =
      user.role === Role.ADMIN
        ? await this.cvRepository.findOne({ where: { id } })
        : await this.cvRepository.findOne({
            where: { id, user: { id: user.sub } },
          });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    return cv;
  }

  async updateForUser(
    id: number,
    updateCvDto: UpdateCvDto,
    user: PayloadInterface,
  ): Promise<Cv> {
    const cv = await this.findOneForUser(id, user);
    const { skillIds, ...cvData } = updateCvDto;

    Object.assign(cv, cvData);

    if (skillIds !== undefined) {
      cv.skills = skillIds.map((skillId) => ({ id: skillId }) as Skill);
    }

    return this.cvRepository.save(cv);
  }

  async removeForUser(id: number, user: PayloadInterface): Promise<void> {
    const cv = await this.findOneForUser(id, user);
    await this.cvRepository.softDelete(cv.id);
  }
}

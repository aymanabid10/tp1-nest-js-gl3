import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { CvCreateStartedEvent } from 'src/cv-history/domain/events/cv-create-started.event';
import { CvCreatedEvent } from 'src/cv-history/domain/events/cv-created.event';
import { CvReadEvent } from 'src/cv-history/domain/events/cv-read.event';
import { CvUpdateStartedEvent } from 'src/cv-history/domain/events/cv-update-started.event';
import { CvUpdatedEvent } from 'src/cv-history/domain/events/cv-updated.event';

@Injectable()
export class CvService extends GenericService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(cvRepository);
  }

  async createForOwner(createCvDto: CreateCvDto, ownerId: number): Promise<Cv> {
    this.eventEmitter.emit(
      CvCreateStartedEvent.name,
      new CvCreateStartedEvent(
        ownerId,
        createCvDto as unknown as Record<string, unknown>,
      ),
    );

    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: ownerId },
      skills: createCvDto.skillIds?.map((id) => ({ id })) ?? [],
    });

    const savedCv = await this.cvRepository.save(cv);

    this.eventEmitter.emit(
      CvCreatedEvent.name,
      new CvCreatedEvent(
        ownerId,
        savedCv.id,
        savedCv as unknown as Record<string, unknown>,
      ),
    );

    return savedCv;
  }

  async findAllForAdmin(): Promise<Cv[]> {
    return this.cvRepository.find();
  }

  async findAllForUser(user: PayloadInterface): Promise<Cv[]> {
    if (user.role === Role.ADMIN) {
      const cvs = await this.findAllForAdmin();
      this.emitReadEvents(cvs, user.sub);
      return cvs;
    }

    const cvs = await this.cvRepository.find({
      where: { user: { id: user.sub } },
    });

    this.emitReadEvents(cvs, user.sub);

    return cvs;
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

    this.emitReadEvents(data, user.sub);

    return {
      data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.ceil(total / normalizedLimit),
    };
  }

  async findOneForUser(id: number, user: PayloadInterface): Promise<Cv> {
    const cv = await this.findOneAccessible(id, user);

    this.eventEmitter.emit(CvReadEvent.name, new CvReadEvent(user.sub, cv.id));

    return cv;
  }

  async updateForUser(
    id: number,
    updateCvDto: UpdateCvDto,
    user: PayloadInterface,
  ): Promise<Cv> {
    this.eventEmitter.emit(
      CvUpdateStartedEvent.name,
      new CvUpdateStartedEvent(
        user.sub,
        id,
        updateCvDto as unknown as Record<string, unknown>,
      ),
    );

    const cv = await this.findOneAccessible(id, user);
    const { skillIds, ...cvData } = updateCvDto;

    Object.assign(cv, cvData);

    if (skillIds !== undefined) {
      cv.skills = skillIds.map((skillId) => ({ id: skillId }) as Skill);
    }

    const updatedCv = await this.cvRepository.save(cv);

    this.eventEmitter.emit(
      CvUpdatedEvent.name,
      new CvUpdatedEvent(
        user.sub,
        updatedCv.id,
        updatedCv as unknown as Record<string, unknown>,
      ),
    );

    return updatedCv;
  }

  async removeForUser(id: number, user: PayloadInterface): Promise<void> {
    const cv = await this.findOneAccessible(id, user);
    await this.cvRepository.softDelete(cv.id);
  }

  private async findOneAccessible(
    id: number,
    user: PayloadInterface,
  ): Promise<Cv> {
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

  private emitReadEvents(cvs: Cv[], authorId: number): void {
    for (const cv of cvs) {
      this.eventEmitter.emit(
        CvReadEvent.name,
        new CvReadEvent(authorId, cv.id),
      );
    }
  }
}

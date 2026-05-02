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
import { CV_EVENT, CvEvent, CvEventType } from 'src/cv-history/events/cv.event';

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
      CV_EVENT,
      new CvEvent(
        CvEventType.CREATE_STARTED,
        ownerId,
        ownerId,
        null,
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
      CV_EVENT,
      new CvEvent(
        CvEventType.CREATED,
        ownerId,
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

    this.eventEmitter.emit(
      CV_EVENT,
      new CvEvent(CvEventType.READ, user.sub, cv.user.id, cv.id),
    );

    return cv;
  }

  async updateForUser(
    id: number,
    updateCvDto: UpdateCvDto,
    user: PayloadInterface,
  ): Promise<Cv> {
    const cv = await this.findOneAccessible(id, user);

    this.eventEmitter.emit(
      CV_EVENT,
      new CvEvent(
        CvEventType.UPDATE_STARTED,
        user.sub,
        cv.user.id,
        id,
        updateCvDto as unknown as Record<string, unknown>,
      ),
    );

    const { skillIds, ...cvData } = updateCvDto;

    Object.assign(cv, cvData);

    if (skillIds !== undefined) {
      cv.skills = skillIds.map((skillId) => ({ id: skillId }) as Skill);
    }

    const updatedCv = await this.cvRepository.save(cv);

    this.eventEmitter.emit(
      CV_EVENT,
      new CvEvent(
        CvEventType.UPDATED,
        user.sub,
        updatedCv.user.id,
        updatedCv.id,
        updatedCv as unknown as Record<string, unknown>,
      ),
    );

    return updatedCv;
  }

  async removeForUser(id: number, user: PayloadInterface): Promise<void> {
    const cv = await this.findOneAccessible(id, user);

    this.eventEmitter.emit(
      CV_EVENT,
      new CvEvent(CvEventType.DELETE_STARTED, user.sub, cv.user.id, cv.id),
    );

    await this.cvRepository.softDelete(cv.id);

    this.eventEmitter.emit(
      CV_EVENT,
      new CvEvent(CvEventType.DELETED, user.sub, cv.user.id, cv.id),
    );
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
        CV_EVENT,
        new CvEvent(CvEventType.READ, authorId, cv.user.id, cv.id),
      );
    }
  }
}

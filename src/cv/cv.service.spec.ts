import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';
import { Role } from 'src/shared/enums/role.enum';
import { CV_EVENT, CvEvent, CvEventType } from 'src/cv-history/events/cv.event';

describe('CvService', () => {
  let service: CvService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
    delete: jest.Mock;
    softDelete: jest.Mock;
  };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: getRepositoryToken(Cv),
          useValue: repository,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<CvService>(CvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('emits create started and created events with the owner as target owner', async () => {
    const createDto = {
      name: 'Doe',
      firstname: 'John',
      age: 30,
      cin: 'TN12345678',
      job: 'Engineer',
      skillIds: [1, 2],
    };
    const createdCv = {
      ...createDto,
      user: { id: 7 },
      skills: [{ id: 1 }, { id: 2 }],
    };
    const savedCv = { ...createdCv, id: 15 };

    repository.create.mockReturnValue(createdCv);
    repository.save.mockResolvedValue(savedCv);

    await service.createForOwner(createDto, 7);

    expect(repository.create).toHaveBeenCalledWith({
      ...createDto,
      user: { id: 7 },
      skills: [{ id: 1 }, { id: 2 }],
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      1,
      CV_EVENT,
      new CvEvent(
        CvEventType.CREATE_STARTED,
        7,
        7,
        null,
        createDto as Record<string, unknown>,
      ),
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      CV_EVENT,
      new CvEvent(
        CvEventType.CREATED,
        7,
        7,
        15,
        savedCv as Record<string, unknown>,
      ),
    );
  });

  it('emits read events with the CV owner as target owner', async () => {
    const cv = { id: 11, user: { id: 42 } };
    repository.findOne.mockResolvedValue(cv);

    await service.findOneForUser(11, {
      sub: 42,
      email: 'user@example.com',
      role: Role.USER,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      CV_EVENT,
      new CvEvent(CvEventType.READ, 42, 42, 11),
    );
  });

  it('emits update started and updated events using the existing CV owner', async () => {
    const cv = {
      id: 21,
      name: 'Old',
      firstname: 'Jane',
      age: 31,
      cin: 'TN87654321',
      job: 'Developer',
      user: { id: 50 },
      skills: [],
    };
    const updateDto = { job: 'Architect', skillIds: [4] };
    const updatedCv = {
      ...cv,
      job: 'Architect',
      skills: [{ id: 4 }],
    };

    repository.findOne.mockResolvedValue(cv);
    repository.save.mockResolvedValue(updatedCv);

    await service.updateForUser(21, updateDto, {
      sub: 1,
      email: 'admin@example.com',
      role: Role.ADMIN,
    });

    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      1,
      CV_EVENT,
      new CvEvent(
        CvEventType.UPDATE_STARTED,
        1,
        50,
        21,
        updateDto as Record<string, unknown>,
      ),
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      CV_EVENT,
      new CvEvent(
        CvEventType.UPDATED,
        1,
        50,
        21,
        updatedCv as Record<string, unknown>,
      ),
    );
  });

  it('emits delete started and deleted events around soft delete', async () => {
    const cv = { id: 31, user: { id: 9 } };
    repository.findOne.mockResolvedValue(cv);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await service.removeForUser(31, {
      sub: 9,
      email: 'user@example.com',
      role: Role.USER,
    });

    expect(repository.softDelete).toHaveBeenCalledWith(31);
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      1,
      CV_EVENT,
      new CvEvent(CvEventType.DELETE_STARTED, 9, 9, 31),
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      CV_EVENT,
      new CvEvent(CvEventType.DELETED, 9, 9, 31),
    );
  });
});

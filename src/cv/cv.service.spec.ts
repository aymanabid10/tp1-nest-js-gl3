import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';

describe('CvService', () => {
  let service: CvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: getRepositoryToken(Cv),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CvService>(CvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

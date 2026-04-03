import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';

describe('CvController', () => {
  let controller: CvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [
        {
          provide: CvService,
          useValue: {
            createForOwner: jest.fn(),
            findAllForUser: jest.fn(),
            findAllForAdmin: jest.fn(),
            findOneForUser: jest.fn(),
            updateForUser: jest.fn(),
            removeForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CvController>(CvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

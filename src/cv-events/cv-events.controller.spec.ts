import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface';
import { Role } from 'src/shared/enums/role.enum';
import { CvEventsController } from './cv-events.controller';
import { CvEventsStreamService } from './cv-events-stream.service';

describe('CvEventsController', () => {
  let controller: CvEventsController;
  let streamService: { streamFor: jest.Mock };

  beforeEach(async () => {
    streamService = {
      streamFor: jest.fn(() => of({ type: 'cv.created', data: {} })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvEventsController],
      providers: [
        {
          provide: CvEventsStreamService,
          useValue: streamService,
        },
      ],
    }).compile();

    controller = module.get(CvEventsController);
  });

  it('delegates stream creation to the stream service with the authenticated user', () => {
    const req = {
      user: {
        sub: 1,
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
    } as AuthenticatedRequest;

    const stream = controller.stream(req);

    expect(streamService.streamFor).toHaveBeenCalledWith(req.user);
    expect(stream).toBeDefined();
  });
});

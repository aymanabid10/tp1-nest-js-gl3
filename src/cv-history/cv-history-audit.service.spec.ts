import { Test, TestingModule } from '@nestjs/testing';
import { CvHistoryAuditService } from './cv-history-audit.service';
import {
  CV_HISTORY_REPOSITORY,
  CvHistoryRepositoryInterface,
} from './repositories/cv-history.repository.interface';
import { CvEvent, CvEventType } from './events/cv.event';

describe('CvHistoryAuditService', () => {
  let service: CvHistoryAuditService;
  let repository: { save: jest.Mock };

  beforeEach(async () => {
    repository = {
      save: jest.fn(async (history) => ({ ...history, id: 1 })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvHistoryAuditService,
        {
          provide: CV_HISTORY_REPOSITORY,
          useValue: repository as Pick<CvHistoryRepositoryInterface, 'save'>,
        },
      ],
    }).compile();

    service = module.get(CvHistoryAuditService);
  });

  it('persists a CvEvent as a CvHistory record', async () => {
    const payload = { job: 'Engineer' };
    const event = new CvEvent(CvEventType.UPDATED, 3, 7, 11, payload);

    const result = await service.recordEvent(event);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: CvEventType.UPDATED,
        authorId: 3,
        targetOwnerId: 7,
        cvId: 11,
        payload,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        eventType: CvEventType.UPDATED,
        authorId: 3,
        targetOwnerId: 7,
        cvId: 11,
        payload,
      }),
    );
  });
});

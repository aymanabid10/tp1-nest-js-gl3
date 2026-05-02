import { CvAuditListener } from './cv-audit.listener';
import { CvHistoryAuditService } from './cv-history-audit.service';
import { CvEvent, CvEventType } from './events/cv.event';

describe('CvAuditListener', () => {
  it('delegates CV_EVENT payloads to the audit service', async () => {
    const auditService = {
      recordEvent: jest.fn(async () => ({
        id: 1,
      })),
    } as unknown as CvHistoryAuditService;
    const listener = new CvAuditListener(auditService);
    const event = new CvEvent(CvEventType.CREATED, 4, 4, 12, {
      name: 'Doe',
    });

    await listener.handleCvEvent(event);

    expect(auditService.recordEvent).toHaveBeenCalledWith(event);
  });
});

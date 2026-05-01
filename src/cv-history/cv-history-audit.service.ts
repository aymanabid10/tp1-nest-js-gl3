import { Inject, Injectable } from '@nestjs/common';
import { CvHistory } from './entities/cv-history.entity';
import { CvOperationPhase, CvOperationType } from './enums/cv-operation.enum';
import { CvCreateStartedEvent } from './events/cv-create-started.event';
import { CvCreatedEvent } from './events/cv-created.event';
import { CvReadEvent } from './events/cv-read.event';
import { CvUpdateStartedEvent } from './events/cv-update-started.event';
import { CvUpdatedEvent } from './events/cv-updated.event';
import {
  CV_HISTORY_REPOSITORY,
  CvHistoryRepositoryInterface,
} from './repositories/cv-history.repository.interface';

@Injectable()
export class CvHistoryAuditService {
  constructor(
    @Inject(CV_HISTORY_REPOSITORY)
    private readonly cvHistoryRepository: CvHistoryRepositoryInterface,
  ) {}

  recordCreateStarted(event: CvCreateStartedEvent): Promise<CvHistory> {
    return this.recordStarted(
      CvOperationType.CREATE,
      event.authorId,
      event.partialPayload,
    );
  }

  recordCreated(event: CvCreatedEvent): Promise<CvHistory> {
    return this.recordCompleted(
      CvOperationType.CREATE,
      event.authorId,
      event.cvId,
      event.payload,
    );
  }

  recordUpdateStarted(event: CvUpdateStartedEvent): Promise<CvHistory> {
    return this.recordStarted(
      CvOperationType.UPDATE,
      event.authorId,
      event.partialPayload,
      event.cvId,
    );
  }

  recordUpdated(event: CvUpdatedEvent): Promise<CvHistory> {
    return this.recordCompleted(
      CvOperationType.UPDATE,
      event.authorId,
      event.cvId,
      event.payload,
    );
  }

  recordRead(event: CvReadEvent): Promise<CvHistory> {
    return this.recordCompleted(
      CvOperationType.READ,
      event.authorId,
      event.cvId,
      null,
    );
  }

  private recordStarted(
    operationType: CvOperationType,
    authorId: number,
    payload: Record<string, unknown>,
    cvId: number | null = null,
  ): Promise<CvHistory> {
    return this.saveHistory({
      operationType,
      operationPhase: CvOperationPhase.STARTED,
      authorId,
      cvId,
      payload,
    });
  }

  private recordCompleted(
    operationType: CvOperationType,
    authorId: number,
    cvId: number | null,
    payload: Record<string, unknown> | null,
  ): Promise<CvHistory> {
    return this.saveHistory({
      operationType,
      operationPhase: CvOperationPhase.COMPLETED,
      authorId,
      cvId,
      payload,
    });
  }

  private saveHistory(data: {
    operationType: CvOperationType;
    operationPhase: CvOperationPhase;
    authorId: number;
    cvId: number | null;
    payload: Record<string, unknown> | null;
  }): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = data.operationType;
    cvHistory.operationPhase = data.operationPhase;
    cvHistory.authorId = data.authorId;
    cvHistory.cvId = data.cvId;
    cvHistory.payload = data.payload;

    return this.cvHistoryRepository.save(cvHistory);
  }
}

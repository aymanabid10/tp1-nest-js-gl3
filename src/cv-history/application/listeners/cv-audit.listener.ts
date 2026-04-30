import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvHistory } from '../../domain/entities/cv-history.entity';
import {
  CvOperationPhase,
  CvOperationType,
} from '../../domain/enums/cv-operation.enum';
import { CvCreateStartedEvent } from '../../domain/events/cv-create-started.event';
import { CvCreatedEvent } from '../../domain/events/cv-created.event';
import { CvReadEvent } from '../../domain/events/cv-read.event';
import { CvUpdateStartedEvent } from '../../domain/events/cv-update-started.event';
import { CvUpdatedEvent } from '../../domain/events/cv-updated.event';
import {
  CV_HISTORY_REPOSITORY,
  CvHistoryRepositoryInterface,
} from '../../domain/ports/cv-history.repository.interface';

@Injectable()
export class CvAuditListener {
  constructor(
    @Inject(CV_HISTORY_REPOSITORY)
    private readonly cvHistoryRepository: CvHistoryRepositoryInterface,
  ) {}

  @OnEvent(CvCreateStartedEvent.name)
  handleCvCreateStarted(event: CvCreateStartedEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = CvOperationType.CREATE;
    cvHistory.operationPhase = CvOperationPhase.STARTED;
    cvHistory.authorId = event.authorId;
    cvHistory.cvId = null;
    cvHistory.payload = event.partialPayload;

    return this.cvHistoryRepository.save(cvHistory);
  }

  @OnEvent(CvCreatedEvent.name)
  handleCvCreated(event: CvCreatedEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = CvOperationType.CREATE;
    cvHistory.operationPhase = CvOperationPhase.COMPLETED;
    cvHistory.authorId = event.authorId;
    cvHistory.cvId = event.cvId;
    cvHistory.payload = event.payload;

    return this.cvHistoryRepository.save(cvHistory);
  }

  @OnEvent(CvUpdateStartedEvent.name)
  handleCvUpdateStarted(event: CvUpdateStartedEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = CvOperationType.UPDATE;
    cvHistory.operationPhase = CvOperationPhase.STARTED;
    cvHistory.authorId = event.authorId;
    cvHistory.cvId = event.cvId;
    cvHistory.payload = event.partialPayload;

    return this.cvHistoryRepository.save(cvHistory);
  }

  @OnEvent(CvUpdatedEvent.name)
  handleCvUpdated(event: CvUpdatedEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = CvOperationType.UPDATE;
    cvHistory.operationPhase = CvOperationPhase.COMPLETED;
    cvHistory.authorId = event.authorId;
    cvHistory.cvId = event.cvId;
    cvHistory.payload = event.payload;

    return this.cvHistoryRepository.save(cvHistory);
  }

  @OnEvent(CvReadEvent.name)
  handleCvRead(event: CvReadEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.operationType = CvOperationType.READ;
    cvHistory.operationPhase = CvOperationPhase.COMPLETED;
    cvHistory.authorId = event.authorId;
    cvHistory.cvId = event.cvId;
    cvHistory.payload = null;

    return this.cvHistoryRepository.save(cvHistory);
  }
}

import { Module } from '@nestjs/common';
import { CvEventsController } from './cv-events.controller';
import { CvEventsListener } from './cv-events.listener';
import { CvEventsStreamService } from './cv-events-stream.service';
import { CvSseEventMapper } from './mappers/cv-sse-event.mapper';

@Module({
  controllers: [CvEventsController],
  providers: [CvEventsStreamService, CvSseEventMapper, CvEventsListener],
})
export class CvEventsModule {}

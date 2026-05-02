import {
  Controller,
  MessageEvent,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface';
import { CvEventsStreamService } from './cv-events-stream.service';

@ApiTags('CV Events')
@Controller('cv-events')
@UseGuards(JwtAuthGuard)
export class CvEventsController {
  constructor(private readonly streamService: CvEventsStreamService) {}

  @Sse('stream')
  stream(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
    return this.streamService.streamFor(req.user);
  }
}

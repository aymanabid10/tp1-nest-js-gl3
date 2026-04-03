import { Module } from '@nestjs/common';
import { GenericService } from './services/generic.service';

@Module({
  providers: [GenericService],
  exports: [GenericService],
})
export class CommonModule {}

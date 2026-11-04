import { Module } from '@nestjs/common';
import { ReportsController } from './reports_controller';
import { ReportsService } from './reports_service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

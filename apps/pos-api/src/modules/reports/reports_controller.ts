import { Controller, Get, Query } from '@nestjs/common';
import { ReportQueryDto } from './dto/report_query_dto';
import { ReportsService } from './reports_service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard(@Query() query: ReportQueryDto) {
    return this.reportsService.dashboard(query);
  }
}

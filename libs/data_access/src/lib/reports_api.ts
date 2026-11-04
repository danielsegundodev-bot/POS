import { DashboardReport, ReportQuery } from './models';

export abstract class ReportsApi {
  abstract dashboard(query: ReportQuery): Promise<DashboardReport>;
}

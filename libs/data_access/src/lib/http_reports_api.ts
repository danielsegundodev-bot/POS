import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp, QueryParams } from './api_http';
import { DashboardReport, ReportQuery } from './models';
import { ReportsApi } from './reports_api';

@Injectable({ providedIn: 'root' })
export class HttpReportsApi extends ReportsApi {
  private readonly http = inject(ApiHttp);

  override dashboard(query: ReportQuery): Promise<DashboardReport> {
    const params: QueryParams = {
      from: query.from,
      to: query.to,
    };
    return firstValueFrom(
      this.http.get<DashboardReport>('reports/dashboard', params),
    );
  }
}

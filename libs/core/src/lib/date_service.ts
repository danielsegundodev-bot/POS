import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateService {
  now(): Date {
    return new Date();
  }

  nowIso(): string {
    return this.now().toISOString();
  }

  /** Clave local "YYYY-MM-DD" para agrupar registros por día. */
  todayKey(date: Date = this.now()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

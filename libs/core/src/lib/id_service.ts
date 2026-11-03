import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IdService {
  generate(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

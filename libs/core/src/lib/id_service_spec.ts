import { IdService } from './id_service';

describe('IdService', () => {
  const service = new IdService();

  it('genera identificadores únicos', () => {
    const first = service.generate();
    const second = service.generate();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(8);
  });
});

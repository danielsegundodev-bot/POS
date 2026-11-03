import { TestBed } from '@angular/core/testing';
import { ShellStore } from './shell_store';

describe('ShellStore', () => {
  let store: InstanceType<typeof ShellStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ShellStore);
    store.setSidenavOpen(true);
  });

  it('alterna el estado del sidenav', () => {
    store.toggleSidenav();
    expect(store.isSidenavOpen()).toBe(false);
    store.toggleSidenav();
    expect(store.isSidenavOpen()).toBe(true);
  });

  it('fija el estado del sidenav', () => {
    store.setSidenavOpen(false);
    expect(store.isSidenavOpen()).toBe(false);
  });
});

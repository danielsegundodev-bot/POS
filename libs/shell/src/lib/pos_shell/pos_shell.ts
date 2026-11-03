import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { NAV_ITEMS, NavItem } from '../nav_items';
import { ShellStore } from '../shell_store';

@Component({
  selector: 'pos-shell',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './pos_shell.html',
  styleUrl: './pos_shell.scss',
})
export class PosShellComponent {
  private readonly store = inject(ShellStore);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly navItems: NavItem[] = NAV_ITEMS;
  readonly isSidenavOpen = this.store.isSidenavOpen;
  readonly sidenavMode = signal<'side' | 'over'>('side');
  readonly pageTitle = signal('POS');

  constructor() {
    this.breakpoint
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        const isCompact = result.matches;
        this.sidenavMode.set(isCompact ? 'over' : 'side');
        this.store.setSidenavOpen(!isCompact);
      });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => {
        const routeTitle = this.findTitle(
          this.router.routerState.snapshot.root,
        );
        this.pageTitle.set(routeTitle);
        this.title.setTitle(
          routeTitle === 'POS' ? 'POS' : `${routeTitle} · POS`,
        );
        if (this.sidenavMode() === 'over') {
          this.store.setSidenavOpen(false);
        }
      });
  }

  toggleSidenav(): void {
    this.store.toggleSidenav();
  }

  setSidenavOpen(open: boolean): void {
    this.store.setSidenavOpen(open);
  }

  private findTitle(route: {
    data: Record<string, unknown>;
    firstChild: unknown;
  }): string {
    let current: typeof route | undefined = route;
    let title = 'POS';
    while (current) {
      if (typeof current.data['title'] === 'string') {
        title = current.data['title'];
      }
      current = current.firstChild as typeof current;
    }
    return title;
  }
}

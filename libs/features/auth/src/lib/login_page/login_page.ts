import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PosButtonComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { AuthStore } from '../auth_store';

@Component({
  selector: 'pos-login-page',
  imports: [PosFieldComponent, PosButtonComponent],
  templateUrl: './login_page.html',
  styleUrl: './login_page.scss',
})
export class LoginPageComponent {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = this.store.isLoading;

  setEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  setPassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading()) {
      return;
    }
    this.error.set(null);
    const ok = await this.store.login(this.email().trim(), this.password());
    if (ok) {
      await this.router.navigateByUrl('/inicio');
    } else {
      this.error.set(this.store.loginError() ?? 'No se pudo iniciar sesión');
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { PublicUser, UserInput } from '@pos/data-access';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { SettingsStore } from '../settings_store';

@Component({
  selector: 'pos-settings-page',
  imports: [
    PosPageHeaderComponent,
    PosEmptyStateComponent,
    PosButtonComponent,
    PosFieldComponent,
  ],
  templateUrl: './settings_page.html',
  styleUrl: './settings_page.scss',
})
export class SettingsPageComponent implements OnInit {
  private readonly store = inject(SettingsStore);

  readonly settings = this.store.settings;
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly users = this.store.usersList;
  readonly usersLoading = this.store.usersLoadingState;
  readonly usersError = this.store.usersLoadError;

  readonly storeName = signal('');
  readonly storeAddress = signal('');
  readonly currency = signal('MXN');
  readonly taxLabel = signal('IVA');

  readonly editingUserId = signal<string | null>(null);
  readonly userFormOpen = signal(false);
  readonly userName = signal('');
  readonly userEmail = signal('');
  readonly userPassword = signal('');
  readonly userRole = signal('cashier');
  readonly userActive = signal(true);

  ngOnInit(): void {
    void this.store.loadSettings().then(() => this.hydrate());
    void this.store.loadUsers();
  }

  private hydrate(): void {
    const settings = this.settings();
    if (!settings) {
      return;
    }
    this.storeName.set(settings.storeName);
    this.storeAddress.set(settings.storeAddress);
    this.currency.set(settings.currency);
    this.taxLabel.set(settings.taxLabel);
  }

  setStoreName(event: Event): void {
    this.storeName.set((event.target as HTMLInputElement).value);
  }

  setStoreAddress(event: Event): void {
    this.storeAddress.set((event.target as HTMLInputElement).value);
  }

  setCurrency(event: Event): void {
    this.currency.set((event.target as HTMLInputElement).value);
  }

  setTaxLabel(event: Event): void {
    this.taxLabel.set((event.target as HTMLInputElement).value);
  }

  async saveSettings(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading()) {
      return;
    }
    await this.store.saveSettings({
      storeName: this.storeName().trim(),
      storeAddress: this.storeAddress().trim(),
      currency: this.currency().trim() || 'MXN',
      taxLabel: this.taxLabel().trim() || 'IVA',
    });
  }

  openNewUser(): void {
    this.editingUserId.set(null);
    this.userName.set('');
    this.userEmail.set('');
    this.userPassword.set('');
    this.userRole.set('cashier');
    this.userActive.set(true);
    this.userFormOpen.set(true);
  }

  editUser(user: PublicUser): void {
    this.editingUserId.set(user.id);
    this.userName.set(user.name);
    this.userEmail.set(user.email);
    this.userPassword.set('');
    this.userRole.set(user.role);
    this.userActive.set(user.active ?? true);
    this.userFormOpen.set(true);
  }

  closeUserForm(): void {
    this.userFormOpen.set(false);
  }

  setUserName(event: Event): void {
    this.userName.set((event.target as HTMLInputElement).value);
  }

  setUserEmail(event: Event): void {
    this.userEmail.set((event.target as HTMLInputElement).value);
  }

  setUserPassword(event: Event): void {
    this.userPassword.set((event.target as HTMLInputElement).value);
  }

  setUserRole(event: Event): void {
    this.userRole.set((event.target as HTMLSelectElement).value);
  }

  setUserActive(event: Event): void {
    this.userActive.set((event.target as HTMLInputElement).checked);
  }

  canSaveUser(): boolean {
    if (!this.userName().trim() || !this.userEmail().trim()) {
      return false;
    }
    if (!this.editingUserId() && this.userPassword().length < 6) {
      return false;
    }
    return true;
  }

  async saveUser(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSaveUser()) {
      return;
    }
    const input: UserInput = {
      name: this.userName().trim(),
      email: this.userEmail().trim(),
      role: this.userRole(),
      active: this.userActive(),
    };
    if (this.userPassword()) {
      input.password = this.userPassword();
    }
    const ok = await this.store.saveUser(this.editingUserId(), input);
    if (ok) {
      this.closeUserForm();
    }
  }

  async removeUser(user: PublicUser): Promise<void> {
    const ok = window.confirm(`¿Eliminar al usuario "${user.name}"?`);
    if (ok) {
      await this.store.removeUser(user.id);
    }
  }
}

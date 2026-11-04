import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthApi, LoginResponse } from '@pos/data-access';
import { LoginPageComponent } from './login_page';

describe('LoginPageComponent', () => {
  const loginResult: LoginResponse = {
    accessToken: 'tok',
    user: { id: '1', email: 'a@b.c', name: 'Ana', role: 'admin' },
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthApi, useValue: { login: jest.fn() } },
        {
          provide: Router,
          useValue: { navigateByUrl: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('renderiza el formulario de acceso', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Iniciar sesión');
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(2);
  });

  it('llama a login con los datos del formulario', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const api = TestBed.inject(AuthApi);
    (api.login as jest.Mock).mockResolvedValue(loginResult);

    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'a@b.c';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'secret1';
    inputs[1].dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(api.login).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'secret1',
    });
  });
});

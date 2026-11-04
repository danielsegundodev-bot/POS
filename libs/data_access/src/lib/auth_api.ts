import { LoginRequest, LoginResponse } from './models/auth';

export abstract class AuthApi {
  abstract login(request: LoginRequest): Promise<LoginResponse>;
}

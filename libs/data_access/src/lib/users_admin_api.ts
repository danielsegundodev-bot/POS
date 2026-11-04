import { PublicUser, UserInput } from './models';

export abstract class UsersAdminApi {
  abstract list(): Promise<PublicUser[]>;
  abstract create(input: UserInput): Promise<PublicUser>;
  abstract update(id: string, input: UserInput): Promise<PublicUser>;
  abstract remove(id: string): Promise<void>;
}

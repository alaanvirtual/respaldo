import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((u) => this.users.set(u.id, u));
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? User.reconstitute(user.toJSON()) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return User.reconstitute(user.toJSON());
      }
    }
    return null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const normalizedUsername = username.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === normalizedUsername) {
        return User.reconstitute(user.toJSON());
      }
    }
    return null;
  }

  public async findAll(): Promise<User[]> {
    return Array.from(this.users.values()).map((u) => User.reconstitute(u.toJSON()));
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, User.reconstitute(user.toJSON()));
  }

  public async update(user: User): Promise<void> {
    if (!this.users.has(user.id)) {
      throw new Error(`No se puede actualizar: Usuario '${user.id}' no existe.`);
    }
    this.users.set(user.id, User.reconstitute(user.toJSON()));
  }

  public async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

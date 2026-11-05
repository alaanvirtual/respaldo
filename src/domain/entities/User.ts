import { DomainError } from '../errors/DomainError';

export type UserRole =
  'Administrador' | 'Operador de Envíos / Fraccionador' | 'Cliente' | 'Admin' | 'Customer';

export const VALID_USER_ROLES: UserRole[] = [
  'Administrador',
  'Operador de Envíos / Fraccionador',
  'Cliente',
  'Admin',
  'Customer',
];

export class InvalidUserDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export interface UserProps {
  id: string;
  fullname: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateUserProps = Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export class User {
  private readonly _id: string;
  private _fullname: string;
  private _username: string;
  private _email: string;
  private _passwordHash: string;
  private _role: UserRole;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    this.validate(props);

    this._id = props.id;
    this._fullname = props.fullname.trim();
    this._username = props.username.trim().toLowerCase();
    this._email = props.email.trim().toLowerCase();
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateUserProps): User {
    const id =
      props.id ?? 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    return new User({
      ...props,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private validate(props: UserProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidUserDataError('El ID del usuario es obligatorio.');
    }
    if (!props.fullname || props.fullname.trim().length === 0) {
      throw new InvalidUserDataError('El nombre completo es obligatorio.');
    }
    if (!props.username || props.username.trim().length < 3) {
      throw new InvalidUserDataError('El nombre de usuario debe contener al menos 3 caracteres.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!props.email || !emailRegex.test(props.email)) {
      throw new InvalidUserDataError('El correo electrónico proporcionado no es válido.');
    }
    if (!props.passwordHash || props.passwordHash.length === 0) {
      throw new InvalidUserDataError('El hash de contraseña es obligatorio.');
    }
    if (!VALID_USER_ROLES.includes(props.role)) {
      throw new InvalidUserDataError(
        `Rol inválido '${props.role}'. Debe ser uno de: ${VALID_USER_ROLES.join(', ')}.`,
      );
    }
  }

  // --- Métodos de negocio ---

  public changeRole(newRole: UserRole): void {
    if (!VALID_USER_ROLES.includes(newRole)) {
      throw new InvalidUserDataError(`Rol no soportado: ${newRole}`);
    }
    this._role = newRole;
    this._updatedAt = new Date();
  }

  public updatePasswordHash(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.trim().length === 0) {
      throw new InvalidUserDataError('El nuevo hash de contraseña no puede estar vacío.');
    }
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  public updateProfile(fullname: string, email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new InvalidUserDataError('El correo electrónico proporcionado no es válido.');
    }
    if (!fullname || fullname.trim().length === 0) {
      throw new InvalidUserDataError('El nombre no puede estar vacío.');
    }

    this._fullname = fullname.trim();
    this._email = email.trim().toLowerCase();
    this._updatedAt = new Date();
  }

  // --- Getters ---

  public get id(): string {
    return this._id;
  }

  public get fullname(): string {
    return this._fullname;
  }

  public get username(): string {
    return this._username;
  }

  public get email(): string {
    return this._email;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public toJSON(): UserProps {
    return {
      id: this._id,
      fullname: this._fullname,
      username: this._username,
      email: this._email,
      passwordHash: this._passwordHash,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

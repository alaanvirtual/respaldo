import { UserRole } from '../../domain/entities/User';

export interface CreateUserDTO {
  fullname: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  fullname?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponseDTO {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

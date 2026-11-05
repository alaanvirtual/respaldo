import { UserResponseDTO } from './UserDTO';

export interface LoginDTO {
  email?: string;
  username?: string;
  usernameOrEmail?: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  accessToken: string;
  user: UserResponseDTO;
}

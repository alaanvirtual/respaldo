export type UserRole =
  'Administrador' | 'Operador de Envíos / Fraccionador' | 'Cliente' | 'Admin' | 'Customer';

export interface IUser {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
}

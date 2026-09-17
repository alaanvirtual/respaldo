export type UserRole = 'Admin' | 'Customer';
export interface IUser {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
}

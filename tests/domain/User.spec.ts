import { User, InvalidUserDataError } from '../../src/domain/entities/User';

describe('User Domain Entity', () => {
  it('debe crear un usuario válido con los datos correctos', () => {
    const user = User.create({
      fullname: 'Alan Peña',
      username: 'alanmasterpro',
      email: 'alanmasterpro25@gmail.com',
      passwordHash: 'hashed_password_123',
      role: 'Admin',
    });

    expect(user.id).toBeDefined();
    expect(user.fullname).toBe('Alan Peña');
    expect(user.username).toBe('alanmasterpro');
    expect(user.email).toBe('alanmasterpro25@gmail.com');
    expect(user.role).toBe('Admin');
  });

  it('debe lanzar InvalidUserDataError si el correo es inválido', () => {
    expect(() => {
      User.create({
        fullname: 'Usuario Test',
        username: 'usuario123',
        email: 'correo-invalido',
        passwordHash: 'hashed_password_123',
        role: 'Customer',
      });
    }).toThrow(InvalidUserDataError);
  });

  it('debe permitir cambiar de rol válidamente', () => {
    const user = User.create({
      fullname: 'Usuario Rol',
      username: 'usuario_rol',
      email: 'rol@blfragancias.com',
      passwordHash: 'hashed_password_123',
      role: 'Customer',
    });

    user.changeRole('Admin');
    expect(user.role).toBe('Admin');
  });
});

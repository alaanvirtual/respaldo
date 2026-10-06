import bcrypt from 'bcryptjs';

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  public async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

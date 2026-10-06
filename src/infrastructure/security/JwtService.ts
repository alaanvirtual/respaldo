import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface IJwtService {
  sign(payload: TokenPayload, expiresIn?: string): string;
  verify(token: string): TokenPayload;
}

export class JwtService implements IJwtService {
  private readonly secretKey: string;
  private readonly defaultExpiresIn: string;

  constructor(secretKey?: string, defaultExpiresIn: string = '24h') {
    this.secretKey = secretKey ?? process.env.JWT_SECRET ?? 'bl_fragancias_fallback_secret_key';
    this.defaultExpiresIn = defaultExpiresIn;
  }

  public sign(payload: TokenPayload, expiresIn?: string): string {
    const options: SignOptions = {
      expiresIn: (expiresIn ?? this.defaultExpiresIn) as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.secretKey, options);
  }

  public verify(token: string): TokenPayload {
    return jwt.verify(token, this.secretKey) as TokenPayload;
  }
}

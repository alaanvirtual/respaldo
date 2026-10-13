// src/utils/crypto_util.ts - Utilitario de cifrado reversible para decorador de repositorios
export class CryptoUtil {
  public encrypt(plainText: string): string {
    return Buffer.from(plainText, 'utf-8').toString('base64');
  }

  public decrypt(cipherText: string): string {
    return Buffer.from(cipherText, 'base64').toString('utf-8');
  }
}

export const cryptoUtil = new CryptoUtil();

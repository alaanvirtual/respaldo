// src/utils/validator.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    for (let validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err: any) => ({
      [err.type === 'field' ? err.path : 'param']: err.msg
    }));

    return res.status(400).json({
      statusCode: 400,
      status: 'error',
      errors: formattedErrors
    });
  };
};

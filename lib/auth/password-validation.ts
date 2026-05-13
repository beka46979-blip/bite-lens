/**
 * Валидация сложного пароля
 * Требования:
 * - Минимум 8 символов
 * - Хотя бы одна строчная буква (a-z)
 * - Хотя бы одна заглавная буква (A-Z)
 * - Хотя бы одна цифра (0-9)
 * - Хотя бы один специальный символ (!@#$%^&* и т.д.)
 */

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  requirements?: {
    minLength: boolean;
    hasLowerCase: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!requirements.minLength) {
    return { 
      valid: false, 
      error: 'Password must be at least 8 characters',
      requirements 
    };
  }
  
  if (!requirements.hasLowerCase) {
    return { 
      valid: false, 
      error: 'Password must contain at least one lowercase letter',
      requirements 
    };
  }
  
  if (!requirements.hasUpperCase) {
    return { 
      valid: false, 
      error: 'Password must contain at least one uppercase letter',
      requirements 
    };
  }
  
  if (!requirements.hasNumber) {
    return { 
      valid: false, 
      error: 'Password must contain at least one number',
      requirements 
    };
  }
  
  if (!requirements.hasSpecialChar) {
    return { 
      valid: false, 
      error: 'Password must contain at least one special character',
      requirements 
    };
  }
  
  return { valid: true, requirements };
}

export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

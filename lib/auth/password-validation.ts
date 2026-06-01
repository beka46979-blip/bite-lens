/**
 * Валидация сложного пароля
 * Требования:
 * - Минимум 8 символов
 * - Хотя бы одна буква (a-z или A-Z)
 * - Хотя бы одна цифра (0-9)
 * - Хотя бы один специальный символ (!@#$%^&* и т.д.)
 */

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  requirements?: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!requirements.minLength) {
    return { 
      valid: false, 
      error: 'Пароль должен содержать минимум 8 символов',
      requirements 
    };
  }
  
  if (!requirements.hasLetter) {
    return { 
      valid: false, 
      error: 'Пароль должен содержать хотя бы одну букву',
      requirements 
    };
  }
  
  if (!requirements.hasNumber) {
    return { 
      valid: false, 
      error: 'Пароль должен содержать хотя бы одну цифру',
      requirements 
    };
  }
  
  if (!requirements.hasSpecialChar) {
    return { 
      valid: false, 
      error: 'Пароль должен содержать хотя бы один специальный символ',
      requirements 
    };
  }
  
  return { valid: true, requirements };
}

export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

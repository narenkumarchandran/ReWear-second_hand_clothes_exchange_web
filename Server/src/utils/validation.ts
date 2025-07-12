
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`;
  }

  if (value && rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address';
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (value && rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: Record<string, string>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field] || '', rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

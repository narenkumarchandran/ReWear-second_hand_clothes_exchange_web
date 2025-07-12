
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${error ? 'border-red-500 focus:border-red-500' : 'border-green-200 focus:border-green-400'} bg-white`}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

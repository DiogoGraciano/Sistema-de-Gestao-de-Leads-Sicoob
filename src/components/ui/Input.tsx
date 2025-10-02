import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, variant = 'modern', size = 'md', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'py-2 px-3 text-sm',
      md: 'py-3 px-4 text-sm',
      lg: 'py-4 px-5 text-base',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md',
      modern: 'border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl bg-white transition-all duration-200',
      minimal: 'border-0 border-b-2 border-gray-200 focus:border-orange-500 rounded-none bg-transparent',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block w-full outline-none transition-all duration-200 placeholder-gray-400',
              variantClasses[variant],
              sizeClasses[size],
              {
                'pl-12': leftIcon,
                'pr-12': rightIcon,
                'border-red-300 focus:border-red-500 focus:ring-red-500/20': error,
                'hover:shadow-md': variant === 'modern',
              },
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className, 
    id, 
    variant = 'modern', 
    size = 'md', 
    resize = 'vertical',
    rows = 4,
    ...props 
  }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'py-2 px-3 text-sm',
      md: 'py-3 px-4 text-sm',
      lg: 'py-4 px-5 text-base',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md',
      modern: 'border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl bg-white transition-all duration-200',
      minimal: 'border-0 border-b-2 border-gray-200 focus:border-teal-500 rounded-none bg-transparent',
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
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
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={clsx(
              'block w-full outline-none transition-all duration-200 placeholder-gray-400',
              variantClasses[variant],
              sizeClasses[size],
              resizeClasses[resize],
              {
                'border-red-300 focus:border-red-500 focus:ring-red-500/20': error,
                'hover:shadow-md': variant === 'modern',
                'min-h-[100px]': variant === 'modern', // Ensure minimum height for modern variant
              },
              className
            )}
            {...props}
          />
          {/* Character count indicator - can be enabled via props if needed */}
          {props.maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {(props.value?.toString().length || 0)} / {props.maxLength}
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

Textarea.displayName = 'Textarea';

export default Textarea;

import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'glass' | 'bordered';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  variant = 'default',
  hover = true,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
    glass: 'glass-effect',
    bordered: 'bg-white border-2 border-gray-100',
  };

  const classes = clsx(
    'rounded-xl transition-all duration-300 animate-fade-in',
    variantClasses[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    hover && 'hover:shadow-lg hover:transform hover:scale-[1.02] hover:-translate-y-1',
    className
  );

  return <div className={classes}>{children}</div>;
};

export default Card;

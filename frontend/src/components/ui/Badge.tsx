import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gym';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', outline = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200';
    
    const variants = {
      primary: outline 
        ? 'text-primary-700 bg-primary-50 border border-primary-200' 
        : 'badge-primary',
      secondary: outline
        ? 'text-primary-700 bg-primary-50 border border-primary-200'
        : 'bg-primary-600 text-white',
      success: outline
        ? 'text-success-700 bg-success-50 border border-success-200'
        : 'badge-success',
      danger: outline
        ? 'text-danger-700 bg-danger-50 border border-danger-200'
        : 'bg-danger-600 text-white',
      warning: outline
        ? 'text-warning-700 bg-warning-50 border border-warning-200'
        : 'bg-warning-600 text-white',
      info: outline
        ? 'text-blue-700 bg-blue-50 border border-blue-200'
        : 'bg-blue-600 text-white',
      gym: outline
        ? 'text-gym-dark bg-gym-orange/10 border border-gym-orange/30'
        : 'badge-gym'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge }; 
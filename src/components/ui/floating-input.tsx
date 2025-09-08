'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, value, onChange, className, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const hasValue = value && value.toString().length > 0;

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            `input peer w-full px-4 pt-6 pb-2
             transition-all duration-fast`,
            className
          )}
        />
        <label
          className={cn(
            `label absolute left-4 transition-all duration-fast pointer-events-none
             ${
               focused || hasValue
                 ? 'top-2 text-caption text-primary'
                 : 'top-4 text-body text-text-secondary'
             }`
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };

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
            `peer w-full px-4 pt-6 pb-2 text-gray-900 
             bg-white/70 backdrop-blur-md
             border-2 border-gray-200 rounded-lg
             transition-all duration-300
             focus:border-blue-500 focus:bg-white
             hover:border-gray-300
             dark:bg-gray-800/70 dark:text-white
             dark:border-gray-600 dark:focus:border-blue-400`,
            className
          )}
        />
        <label
          className={cn(
            `absolute left-4 transition-all duration-300 pointer-events-none
             ${
               focused || hasValue
                 ? 'top-2 text-xs text-blue-600 dark:text-blue-400'
                 : 'top-4 text-base text-gray-500 dark:text-gray-400'
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

// components/ExtraWideMathInput.tsx
'use client';
import dynamic from 'next/dynamic';

import { useState, useEffect } from 'react';
// Load react-mathquill dynamically on the client to avoid SSR "window is not defined"
const EditableMathField = dynamic(
  async () => {
    const mod = await import('react-mathquill');
    if (typeof window !== 'undefined' && mod.addStyles) {
      mod.addStyles();
    }
    return mod.EditableMathField;
  },
  { ssr: false }
);

interface ExtraWideMathInputProps {
  value?: string;
  onChange?: (latex: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ExtraWideMathInput({
  value = '',
  onChange,
  placeholder = 'Type your mathematical expression here...',
  className = '',
  disabled = false,
  size = 'lg',
}: ExtraWideMathInputProps) {
  // We don't keep the mathfield instance in state to avoid SSR/serialization issues
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (mq: unknown) => {
    // The mathquill instance exposes a latex() method; guard with runtime check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latex = (mq as any)?.latex?.();
    if (typeof latex === 'string') {
      setInternalValue(latex);
      onChange?.(latex);
    }
  };

  const sizeClasses = {
    sm: 'min-w-[300px] px-3 py-2 text-sm',
    md: 'min-w-[400px] px-4 py-3',
    lg: 'min-w-[500px] px-4 py-3 text-lg',
    xl: 'min-w-[600px] px-5 py-4 text-xl',
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border border-gray-300 rounded-lg
          bg-white text-gray-900 placeholder-gray-500
          focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
          transition-all duration-200  
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
          min-h-[60px] flex items-center relative
        `}
      >
        <EditableMathField
          latex={internalValue}
          onChange={handleChange}
          mathquillDidMount={() => {
            // no-op: we intentionally don't persist the instance
            return;
          }}
          config={{
            spaceBehavesLikeTab: true,
            restrictMismatchedBrackets: true,
          }}
          className="w-full math-input-extra-wide"
        />
        
        {!internalValue && (
          <div className="absolute left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
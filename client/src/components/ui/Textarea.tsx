import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-slate-700"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={clsx(
          'w-full px-3 py-2.5 text-sm rounded-xl border',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors resize-none',
          error
            ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
            : 'border-slate-200 focus:ring-brand-100 focus:border-brand-400',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
};

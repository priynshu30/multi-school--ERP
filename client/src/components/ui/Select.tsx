import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full px-3 py-2.5 text-sm rounded-xl border bg-white appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
          error
            ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400 text-rose-700'
            : 'border-slate-200 focus:ring-brand-100 focus:border-brand-400 text-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
};

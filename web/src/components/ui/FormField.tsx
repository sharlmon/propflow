import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

export function FormField({ label, error, id, className = '', ...props }: FormFieldProps) {
  const inputId = id || props.name;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-700" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

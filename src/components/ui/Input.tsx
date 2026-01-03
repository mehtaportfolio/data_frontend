import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  secure?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  secure = false,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secure || type === 'password';
  const inputType = isPassword ? showPassword ? 'text' : 'password' : type;
  return <div className="w-full space-y-2">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>}
        <div className="relative">
          <input ref={ref} type={inputType} className={`
              flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400
              ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 dark:border-gray-800'}
              ${className}
            `} {...props} />
          {isPassword && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>}
        </div>
        {error && <p className="text-sm text-red-500 animate-in slide-in-from-top-1 fade-in">
            {error}
          </p>}
      </div>;
});
Input.displayName = 'Input';
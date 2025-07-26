import { LabelHTMLAttributes } from 'react';

export function Label({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>
      {children}
    </label>
  );
} 
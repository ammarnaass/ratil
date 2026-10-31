'use client';

/**
 * رتل - Ratil
 * خطاف إدارة نماذج المصادقة وحالتها (Hook)
 * features/auth/hooks/useAuthForm.ts
 */

import { useState } from 'react';

export function useAuthForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof T, val: any) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setGeneralError(null);
    setIsLoading(false);
  };

  return {
    values,
    errors,
    generalError,
    isLoading,
    setValues,
    setErrors,
    setGeneralError,
    setIsLoading,
    handleChange,
    resetForm,
  };
}

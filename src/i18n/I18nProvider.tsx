import React, { createContext, useContext, useMemo } from 'react';
import { ar } from './ar';

type I18nContextType = {
  t: typeof ar;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ t: ar }), []);
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return { t: ar };
  }
  return context;
}
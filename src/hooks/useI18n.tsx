import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { I18nManager } from 'react-native';

interface I18nContextType {
  isRTL: boolean;
  locale: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const isRTL = true;
  const locale = 'ar';

  useEffect(() => {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }, [isRTL]);

  return (
    <I18nContext.Provider value={{ isRTL, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

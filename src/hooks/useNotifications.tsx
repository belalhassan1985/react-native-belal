import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.status === 'success') {
        setUnreadCount(response.data?.count ?? 0);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      await refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch {
      await refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      isLoading: false,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      refreshUnreadCount: async () => {},
    };
  }
  return context;
}
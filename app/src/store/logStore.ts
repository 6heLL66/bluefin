import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LogEntry, LogStore } from '../types'

export const useLogStore = create<LogStore>()(
  persist(
    (set) => ({
      logs: [],
      
      addLog: (log) => {
        const newLog: LogEntry = {
          ...log,
          timestamp: Date.now(),
        }
        
        set((state) => ({
          logs: [newLog, ...state.logs]
        }))
      },
      
      clearLogs: () => {
        set({ logs: [] })
      },
    }),
    {
      name: 'log-storage',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
) 
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LogEntry, LogStore } from '../types'

export const useLogStore = create<LogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      
      addLog: (log) => {
        const newLog: LogEntry = {
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 1000)
        }))
      },
      
      clearLogs: () => {
        set({ logs: [] })
      },
      
      getLogsByCategory: (category) => {
        return get().logs.filter(log => log.category === category)
      },
      
      getLogsBySpread: (spreadId) => {
        return get().logs.filter(log => log.spreadId === spreadId)
      },
      
      getLogsByAsset: (asset) => {
        return get().logs.filter(log => log.asset === asset)
      },
    }),
    {
      name: 'log-storage',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
) 
import { useLogStore } from '../store/logStore'
import { LogEntry } from '../types'

export const useLogger = () => {
  const { addLog } = useLogStore()

  const log = {
    info: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'INFO',
        category: 'SYSTEM',
        message,
        details,
        spreadId,
        asset,
      })
    },

    warning: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'WARNING',
        category: 'SYSTEM',
        message,
        details,
        spreadId,
        asset,
      })
    },

    error: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'ERROR',
        category: 'SYSTEM',
        message,
        details,
        spreadId,
        asset,
      })
    },

    success: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'SUCCESS',
        category: 'SYSTEM',
        message,
        details,
        spreadId,
        asset,
      })
    },

    websocket: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'INFO',
        category: 'WEBSOCKET',
        message,
        details,
        spreadId,
        asset,
      })
    },

    order: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'INFO',
        category: 'ORDER',
        message,
        details,
        spreadId,
        asset,
      })
    },

    position: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'INFO',
        category: 'POSITION',
        message,
        details,
        spreadId,
        asset,
      })
    },

    spread: (message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level: 'INFO',
        category: 'SPREAD',
        message,
        details,
        spreadId,
        asset,
      })
    },

    custom: (level: LogEntry['level'], category: LogEntry['category'], message: string, details?: Record<string, unknown>, spreadId?: string, asset?: string) => {
      addLog({
        level,
        category,
        message,
        details,
        spreadId,
        asset,
      })
    },
  }

  return log
} 
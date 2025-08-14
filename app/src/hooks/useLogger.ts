import { useLogStore } from '../store/logStore'
import { SpreadData } from '../tabs/Spread/constants'

export const useLogger = () => {
  const { addLog } = useLogStore()

  const log = {
    spread: (message: string, details?: Record<string, unknown>, spread?: SpreadData, asset?: string) => {
      addLog({
        category: 'SPREAD',
        message,
        details,
        spread,
        asset,
      })
    },

    batch: (message: string, details?: Record<string, unknown>, asset?: string) => {
      addLog({
        category: 'BATCH',
        message,
        details,
        asset,
      })
    },
  }

  return log
}

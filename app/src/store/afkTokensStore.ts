import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AfkTokensState {
  afkTokens: number[]
  toggleToken: (marketId: number) => void
  isTokenAfk: (marketId: number) => boolean
  clearAll: () => void
}

export const useAfkTokensStore = create<AfkTokensState>()(
  persist(
    (set, get) => ({
      afkTokens: [],
      
      toggleToken: (marketId: number) => {
        set((state) => {
          const newAfkTokens = state.afkTokens.includes(marketId)
            ? state.afkTokens.filter(id => id !== marketId)
            : [...state.afkTokens, marketId]
          return { afkTokens: newAfkTokens }
        })
      },
      
      isTokenAfk: (marketId: number) => {
        return get().afkTokens.includes(marketId)
      },
      
      clearAll: () => {
        set({ afkTokens: [] })
      }
    }),
    {
      name: 'afk-tokens-storage'
    }
  )
)

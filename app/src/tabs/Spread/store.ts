import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { AccountWithPositionsDto, TokenDto_Output } from '../../api'
import { FuturePositionWithMargin, Market } from '../../bp-api'
import { SpreadData } from './constants'

interface SpreadConfig {
  lighterMarkets: TokenDto_Output[]
  lighterPublicKey: string
  lighterPrivateKey: string
  backpackMarkets: Market[]
  backpackApiPublicKey: string
  backpackApiSecretKey: string
  spreads: SpreadData[]
  pausedSpreads: Set<string>
}

interface SpreadStore extends SpreadConfig {
  setLighterPublicKey: (key: string) => void
  setLighterPrivateKey: (key: string) => void
  setBackpackApiPublicKey: (key: string) => void
  setBackpackApiSecretKey: (key: string) => void
  setSpreads: (spreads: SpreadData[]) => void
  setLastTimeFilled: (id: string, time: number) => void
  setSpreadPositions: (id: string, lighterPositions: AccountWithPositionsDto['positions'], backpackPositions: FuturePositionWithMargin[]) => void
  updateSpreadStatus: (id: string, status: SpreadData['status']) => void
  updateSpread: (id: string, updates: Partial<SpreadData>) => void
  setBackpackMarkets: (markets: Market[]) => void
  setLighterMarkets: (markets: TokenDto_Output[]) => void
  createSpread: (spread: SpreadData) => void
  deleteSpread: (id: string) => void
  toggleSpreadPause: (spreadId: string) => void
  pauseAllSpreads: () => void
  resumeAllSpreads: () => void
}

export const useSpreadStore = create<SpreadStore>()(
  persist(
    set => ({
      lighterPublicKey: '',
      lighterPrivateKey: '',
      lighterMarkets: [],
      backpackMarkets: [],
      backpackApiPublicKey: '',
      backpackApiSecretKey: '',
      spreads: [],
      pausedSpreads: new Set(),

      setBackpackMarkets: (markets: Market[]) => set({ backpackMarkets: markets }),

      setLighterMarkets: (markets: TokenDto_Output[]) => set({ lighterMarkets: markets }),

      setLighterPublicKey: (key: string) => set({ lighterPublicKey: key }),

      setLighterPrivateKey: (key: string) => set({ lighterPrivateKey: key }),

      setLastTimeFilled: (id: string, time: number) =>
        set(state => ({
          spreads: state.spreads.map(spread => (spread.id === id ? { ...spread, lastTimeFilled: time } : spread)),
        })),

      setBackpackApiPublicKey: (key: string) => set({ backpackApiPublicKey: key }),

      setBackpackApiSecretKey: (key: string) => set({ backpackApiSecretKey: key }),

      updateSpreadStatus: (id: string, status: SpreadData['status']) =>
        set(state => ({
          spreads: state.spreads.map(spread => (spread.id === id ? { ...spread, status } : spread)),
        })),

      setSpreads: (spreads: SpreadData[]) => set({ spreads }),

      setSpreadPositions: (id: string, lighterPositions: AccountWithPositionsDto['positions'], backpackPositions: FuturePositionWithMargin[]) =>
        set(state => ({
          spreads: state.spreads.map(spread => (spread.id === id ? { ...spread, lighterPositions, backpackPositions } : spread)),
        })),

      updateSpread: (id: string, updates: Partial<SpreadData>) =>
        set(state => ({
          spreads: state.spreads.map(spread => (spread.id === id ? { ...spread, ...updates } : spread)),
        })),

      createSpread: (spread: SpreadData) => set(state => ({ spreads: [...state.spreads, spread] })),
      
      deleteSpread: (id: string) =>
        set(state => ({
          spreads: state.spreads.filter(spread => spread.id !== id),
        })),

      toggleSpreadPause: (spreadId: string) =>
        set(state => {
          const newSet = new Set(state.pausedSpreads)
          if (newSet.has(spreadId)) {
            newSet.delete(spreadId)
          } else {
            newSet.add(spreadId)
          }
          return { pausedSpreads: newSet }
        }),

      pauseAllSpreads: () =>
        set(state => ({
          pausedSpreads: new Set(state.spreads.map(spread => spread.id))
        })),

      resumeAllSpreads: () =>
        set({ pausedSpreads: new Set() }),
    }),
    {
      name: 'spread-config',
      partialize: state => ({
        lighterPublicKey: state.lighterPublicKey,
        lighterPrivateKey: state.lighterPrivateKey,
        backpackApiPublicKey: state.backpackApiPublicKey,
        backpackApiSecretKey: state.backpackApiSecretKey,
        spreads: state.spreads,
        pausedSpreads: Array.from(state.pausedSpreads),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.pausedSpreads = new Set(state.pausedSpreads || [])
        }
      },
    },
  ),
)

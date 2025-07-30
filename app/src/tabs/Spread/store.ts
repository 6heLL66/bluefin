import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SpreadData } from './constants'
import { TokenDto } from '../../api'

interface SpreadConfig {
  lighterMarkets: TokenDto[]
  lighterPublicKey: string
  lighterPrivateKey: string
  backpackApiPublicKey: string
  backpackApiSecretKey: string
  spreads: SpreadData[]
}

interface SpreadStore extends SpreadConfig {
  setLighterPublicKey: (key: string) => void
  setLighterPrivateKey: (key: string) => void
  setBackpackApiPublicKey: (key: string) => void
  setBackpackApiSecretKey: (key: string) => void
  setSpreads: (spreads: SpreadData[]) => void

  setLighterMarkets: (markets: TokenDto[]) => void
  createSpread: (spread: SpreadData) => void
  deleteSpread: (id: string) => void
}

export const useSpreadStore = create<SpreadStore>()(
  persist(
    (set) => ({
      lighterPublicKey: '',
      lighterPrivateKey: '',
      lighterMarkets: [],
      backpackApiPublicKey: '',
      backpackApiSecretKey: '',
      spreads: [],

      setLighterMarkets: (markets: TokenDto[]) =>
        set({ lighterMarkets: markets }),

      setLighterPublicKey: (key: string) =>
        set({ lighterPublicKey: key }),

      setLighterPrivateKey: (key: string) =>
        set({ lighterPrivateKey: key }),

      setBackpackApiPublicKey: (key: string) =>
        set({ backpackApiPublicKey: key }),

      setBackpackApiSecretKey: (key: string) =>
        set({ backpackApiSecretKey: key }),

      setSpreads: (spreads: SpreadData[]) =>
        set({ spreads }),

      createSpread: (spread: SpreadData) =>
        set(state => ({ spreads: [...state.spreads, spread] })),
      deleteSpread: (id: string) =>
        set(state => ({ spreads: state.spreads.filter(spread => spread.id !== id) })),
    }),
    {
      name: 'spread-config',
      partialize: (state) => ({
        lighterPublicKey: state.lighterPublicKey,
        lighterPrivateKey: state.lighterPrivateKey,
        backpackApiPublicKey: state.backpackApiPublicKey,
        backpackApiSecretKey: state.backpackApiSecretKey,
        spreads: state.spreads
      }),
    }
  )
) 
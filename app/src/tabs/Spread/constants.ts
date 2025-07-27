import { HeadCell } from "../../types"

export interface SpreadData {
    id: string
    asset: string
    size: number
    timeOpened: string
    status: 'OPEN' | 'CLOSED' | 'PENDING'
    openSpread: number
    closeSpread: number
    minLifetime: number
  }
  
export const headCells: HeadCell[] = [
    {
      id: 'asset',
      label: 'Asset',
      align: 'left',
      disablePadding: false,
    },
    {
      id: 'size',
      label: 'Size',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'timeOpened',
      label: 'Time Opened',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'openSpread',
      label: 'Open Spread',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'closeSpread',
      label: 'Close Spread',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'minLifetime',
      label: 'Min Lifetime',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      disablePadding: false,
    },
  ]
  
  export const mockSpreads: SpreadData[] = [
    {
      id: '1',
      asset: 'BTC',
      size: 0.1,
      timeOpened: '2024-01-15 10:30:00',
      status: 'OPEN',
      openSpread: 0.05,
      closeSpread: 0.08,
      minLifetime: 300,
    },
    {
      id: '2',
      asset: 'ETH',
      size: 1.5,
      timeOpened: '2024-01-15 09:15:00',
      status: 'CLOSED',
      openSpread: 0.03,
      closeSpread: 0.06,
      minLifetime: 180,
    },
  ]
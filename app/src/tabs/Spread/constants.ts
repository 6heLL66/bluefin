import { HeadCell } from "../../types"

export interface SpreadData {
    id: string
    asset: string
    tokenId: number
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
import { AccountWithPositionsDto } from "../../api"
import { FuturePositionWithMargin } from "../../bp-api"
import { HeadCell } from "../../types"

export interface SpreadData {
    id: string
    asset: string
    tokenId: number
    size: number
    timeOpened: string
    status: 'ORDER FILLING' | 'WAITING'
    openSpread: number
    closeSpread: number
    minLifetime: number
    lighterPositions: AccountWithPositionsDto["positions"]
    backpackPositions: FuturePositionWithMargin[]
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
      id: 'lighterPositions',
      label: 'Lighter Positions',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'backpackPositions',
      label: 'Backpack Positions',
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
      label: 'Open Spread %',
      align: 'center',
      disablePadding: false,
    },
    {
      id: 'closeSpread',
      label: 'Close Spread %',
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
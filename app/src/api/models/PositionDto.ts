/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { ORDER_SIDE } from './ORDER_SIDE'

export type PositionDto = {
  market_id: number
  symbol: string
  leverage: number
  entry_price: string
  position: string
  size: string
  side: ORDER_SIDE
  unrealized_pnl: string
  realized_pnl: string
}

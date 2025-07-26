/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { ORDER_SIDE } from './ORDER_SIDE'
import type { OrderDto } from './OrderDto'

export type PositionDto = {
  market_id: number
  symbol: string
  leverage: number
  entry_price: string
  size: string
  side: ORDER_SIDE
  orders: Array<OrderDto>
}

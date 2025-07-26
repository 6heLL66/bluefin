/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { LighterPositionInfoDto } from './LighterPositionInfoDto'

export type LighterAccountDto = {
  id: number
  address: string
  is_active: boolean
  cancel_all_time: number
  total_order_count: number
  total_isolated_order_count: number
  pending_order_count: number
  collateral: string
  balance: string
  free_balance: string
  positions: Array<LighterPositionInfoDto>
}

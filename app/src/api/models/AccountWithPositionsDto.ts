/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PositionDto } from './PositionDto'

export type AccountWithPositionsDto = {
  address: string
  private_key: string
  lighter_id: number
  balance: string
  free_balance: string
  positions: Array<PositionDto>
}

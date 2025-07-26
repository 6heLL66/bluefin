/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PositionDto } from './PositionDto'

export type AccountWithPositionsDto = {
  private_key: string
  lighter_id: number
  lighter_private_key: string
  lighter_public_key: string
  balance: string
  positions: Array<PositionDto>
}

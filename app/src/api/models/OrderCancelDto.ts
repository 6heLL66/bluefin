/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { BatchAccountDto } from './BatchAccountDto'
import type { UnitCancelDto } from './UnitCancelDto'

export type OrderCancelDto = {
  unit: UnitCancelDto
  accounts: Array<BatchAccountDto>
}

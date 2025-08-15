/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { BatchAccountDto } from './BatchAccountDto'
import type { TokenDto_Input } from './TokenDto_Input'
import type { UnitDto } from './UnitDto'

export type OrderCreateWithTokenDto = {
  token: TokenDto_Input
  unit: UnitDto
  accounts: Array<BatchAccountDto>
}

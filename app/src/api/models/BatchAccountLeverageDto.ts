/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PrivateKeyDto } from './PrivateKeyDto'
import type { ProxyDto } from './ProxyDto'

export type BatchAccountLeverageDto = {
  account: PrivateKeyDto
  proxy?: ProxyDto | null
  leverage: number
  token_id: number
}

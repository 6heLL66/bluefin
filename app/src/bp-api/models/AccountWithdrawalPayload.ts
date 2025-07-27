/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { Blockchain } from './Blockchain'

export type AccountWithdrawalPayload = {
  /**
   * Address to withdraw to.
   */
  address: string
  /**
   * Blockchain to withdraw on.
   */
  blockchain: Blockchain
  /**
   * Custom client id.
   */
  clientId?: string
  /**
   * Quantity to withdraw.
   */
  quantity: string
  /**
   * Symbol of the asset to withdraw.
   */
  symbol: Asset
  /**
   * Issued two factor token.
   */
  twoFactorToken?: string
  /**
   * Auto borrow to withdraw if required.
   */
  autoBorrow?: boolean
  /**
   * Auto redeem a lend if required.
   */
  autoLendRedeem?: boolean
}

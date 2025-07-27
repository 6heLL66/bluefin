/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { DepositSource } from './DepositSource'
import type { DepositStatus } from './DepositStatus'
import type { FiatAsset } from './FiatAsset'

export type Deposit = {
  /**
   * Unique id of the deposit.
   */
  id: number
  /**
   * Deposit address.
   */
  toAddress?: string
  /**
   * Source address.
   */
  fromAddress?: string
  /**
   * Source of the deposit, blockchain or a payment processor.
   */
  source: DepositSource
  /**
   * Status of the deposit.
   */
  status: DepositStatus
  /**
   * Transaction hash of the blockchain transfer.
   */
  transactionHash?: string
  /**
   * Symbol of the asset to be deposited.
   */
  symbol: Asset
  /**
   * Quantity to be deposited.
   */
  quantity: string
  /**
   * When the deposit was created.
   */
  createdAt: string
  /**
   * Amount in fiat currency.
   */
  fiatAmount?: number
  /**
   * Currency of the fiat amount.
   */
  fiatCurrency?: FiatAsset
  /**
   * Institution BIC.
   */
  institutionBic?: string
  /**
   * An optional memo that may be provided by the platform.
   */
  platformMemo?: string
}

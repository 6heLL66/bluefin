/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { Blockchain } from './Blockchain'
import type { EqualsMoneyWithdrawalState } from './EqualsMoneyWithdrawalState'
import type { FiatAsset } from './FiatAsset'
import type { WithdrawalStatus } from './WithdrawalStatus'

export type Withdrawal = {
  /**
   * Unique id of the withdrawal.
   */
  id: number
  /**
   * Blockchain the withdrawal was requested for.
   */
  blockchain: Blockchain
  /**
   * Custom client id.
   */
  clientId?: string
  /**
   * Transaction hash of the withdrawal, if it has been sent.
   */
  identifier?: string
  /**
   * Quantity of the asset to withdraw.
   */
  quantity: string
  /**
   * Fee charged.
   */
  fee: string
  /**
   * Fiat fee charged.
   */
  fiatFee?: string
  /**
   * Fiat state for Equals Money.
   */
  fiatState?: EqualsMoneyWithdrawalState
  /**
   * Fiat symbol.
   */
  fiatSymbol?: FiatAsset
  /**
   * Provider ID for payment provider.
   */
  providerId?: string
  /**
   * Symbol of the asset to withdraw.
   */
  symbol: Asset
  /**
   * Status of the withdrawal.
   */
  status: WithdrawalStatus
  /**
   * ID of the subaccount requesting this withdrawal.
   */
  subaccountId?: number
  /**
   * Address to withdraw to.
   */
  toAddress: string
  /**
   * Transaction hash of withdrawal.
   */
  transactionHash?: string
  /**
   * When the withdrawal was created.
   */
  createdAt: string
  /**
   * Whether the withdrawal is an internal transfer.
   */
  isInternal: boolean
  /**
   * Bank name.
   */
  bankName?: string
  /**
   * Bank identifier.
   */
  bankIdentifier?: string
  /**
   * Account identifier.
   */
  accountIdentifier?: string
  /**
   * When the withdrawal is to be triggered.
   */
  triggerAt?: string
}

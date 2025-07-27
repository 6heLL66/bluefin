/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Blockchain } from './Blockchain'

export type Token = {
  displayName: string
  blockchain: Blockchain
  contractAddress?: string
  depositEnabled: boolean
  minimumDeposit: string
  withdrawEnabled: boolean
  minimumWithdrawal: string
  maximumWithdrawal?: string
  withdrawalFee: string
}

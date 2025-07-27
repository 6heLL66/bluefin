/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { BorrowLendSide } from './BorrowLendSide'

export type BorrowLendExecutePayload = {
  /**
   * The quantity of the asset to repay.
   */
  quantity: string
  /**
   * Side of the borrow lend.
   */
  side: BorrowLendSide
  /**
   * The asset to repay.
   */
  symbol: Asset
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateAccountSettingsRequest = {
  /**
   * If true, then tries to borrow during collateral reconciliation.
   * Collateral reconciliation is a process in which the system reconciles
   * the negative account debt or positive account equity.
   */
  autoBorrowSettlements?: boolean
  /**
   * Determines if the account should automatically lend.
   */
  autoLend?: boolean
  /**
   * Determines if the account should automatically repay borrows with
   * available balance.
   */
  autoRepayBorrows?: boolean
  /**
   * Determines the maximum leverage allowed for the main account or
   * subaccount.
   */
  leverageLimit?: string
}

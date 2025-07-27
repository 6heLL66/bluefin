/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AccountSummary = {
  /**
   * If true, then tries to borrow during collateral reconciliation.
   */
  autoBorrowSettlements: boolean
  /**
   * If true, then tries to automatically lend with available balance.
   */
  autoLend: boolean
  /**
   * Determines if the account should have continuous PnL realization.
   */
  autoRealizePnl: boolean
  /**
   * If true, then tries to automatically repay borrows with available
   * balance.
   */
  autoRepayBorrows: boolean
  /**
   * Borrow limit.
   */
  borrowLimit: string
  /**
   * Futures maker fee in basis points. Negative if a rebate exists.
   */
  futuresMakerFee: string
  /**
   * Futures taker fee in basis points.
   */
  futuresTakerFee: string
  /**
   * Leverage limit of the account.
   */
  leverageLimit: string
  /**
   * Number of open limit orders.
   */
  limitOrders: number
  /**
   * Whether the account is liquidating.
   */
  liquidating: boolean
  /**
   * Position limit.
   */
  positionLimit: string
  /**
   * Spot maker fee in basis points. Negative if a rebate exists.
   */
  spotMakerFee: string
  /**
   * Spot taker fee in basis points.
   */
  spotTakerFee: string
  /**
   * Number of open trigger orders.
   */
  triggerOrders: number
}

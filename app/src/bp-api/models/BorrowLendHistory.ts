/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BorrowLendHistory = {
  /**
   * The rate borrowers pay.
   */
  borrowInterestRate: string
  /**
   * The amount of assets borrowed from the pool.
   */
  borrowedQuantity: string
  /**
   * The APY rate lenders receive.
   */
  lendInterestRate: string
  /**
   * The amount of assets lent to the pool.
   */
  lentQuantity: string
  /**
   * Timestamp of the summary.
   */
  timestamp: string
  /**
   * Utilisation.
   */
  utilization: string
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Balance = {
  /**
   * Funds available for use.
   */
  available: string
  /**
   * Funds that are locked because they are in an order that has not been
   * executed.
   */
  locked: string
  /**
   * Funds that are staked.
   */
  staked: string
}

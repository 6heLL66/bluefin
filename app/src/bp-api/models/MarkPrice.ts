/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MarkPrice = {
  /**
   * The funding rate for the current interval.
   */
  fundingRate: string
  /**
   * The index price for the market.
   */
  indexPrice: string
  /**
   * The mark price for the market.
   */
  markPrice: string
  /**
   * The end time of the current interval and start time of next interval.
   * Funding payments will be distributed at this time.
   */
  nextFundingTimestamp: number
  /**
   * The symbol of the market.
   */
  symbol: string
}

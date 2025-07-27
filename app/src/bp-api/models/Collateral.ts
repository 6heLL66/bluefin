/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Collateral = {
  /**
   * Spot asset of the collateral.
   */
  symbol: string
  /**
   * Mark price of spot instrument
   */
  assetMarkPrice: string
  /**
   * Pre haircut quantity of the asset.
   */
  totalQuantity: string
  /**
   * Balance of spot instrument in USDC.
   * This is calculated as `index_price * balance`.
   */
  balanceNotional: string
  /**
   * Collateral weight of spot instrument, applied as a haircut.
   */
  collateralWeight: string
  /**
   * Collateral Value (or adjusted equity).
   * This is calculated as `index_price * balance * collateral_weight`.
   */
  collateralValue: string
  /**
   * The amount added to collateral from open orders.
   */
  openOrderQuantity: string
  /**
   * The amount added to collateral from lending.
   */
  lendQuantity: string
  /**
   * The amount of freely available assets.
   */
  availableQuantity: string
}

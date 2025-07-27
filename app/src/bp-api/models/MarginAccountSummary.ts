/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Collateral } from './Collateral'

export type MarginAccountSummary = {
  /**
   * Notional value of assets
   */
  assetsValue: string
  /**
   * Total borrow notional.
   */
  borrowLiability: string
  /**
   * Collateral held for a given spot asset.
   */
  collateral: Array<Collateral>
  /**
   * Initial margin fraction.
   */
  imf: string
  /**
   * Unsettled claim on the liquidity fund.
   */
  unsettledEquity: string
  /**
   * Notional value of liabilities
   */
  liabilitiesValue: string
  /**
   * Margin fraction.
   */
  marginFraction?: string
  /**
   * Maintenance margin fraction.
   */
  mmf: string
  /**
   * Net equity.
   */
  netEquity: string
  /**
   * Net equity available.
   */
  netEquityAvailable: string
  /**
   * Net equity Locked.
   */
  netEquityLocked: string
  /**
   * Total exposure of positions as well potential open positions.
   */
  netExposureFutures: string
  /**
   * Unrealised PnL.
   */
  pnlUnrealized: string
}

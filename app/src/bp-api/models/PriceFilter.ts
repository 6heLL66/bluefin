/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PriceBandMarkPrice } from './PriceBandMarkPrice'
import type { PriceBandMeanPremium } from './PriceBandMeanPremium'

export type PriceFilter = {
  /**
   * Minimum price the order book will allow.
   */
  minPrice: string
  /**
   * Maximum price the order book will allow.
   */
  maxPrice?: string
  /**
   * Price increment.
   */
  tickSize: string
  /**
   * Maximum allowed multiplier from last active price.
   */
  maxMultiplier?: string
  /**
   * Minimum allowed multiplier from last active price.
   */
  minMultiplier?: string
  /**
   * Maximum allowed impact multiplier from best offer. This
   * determines how far above the best ask a market buy can penetrate.
   */
  maxImpactMultiplier?: string
  /**
   * Minimum allowed impact multiplier from best bid. This
   * determines how far below the best bid a market sell can penetrate.
   */
  minImpactMultiplier?: string
  /**
   * Futures price band. Used to determine how far the price is allowed to
   * deviate from the mean mark price.
   */
  meanMarkPriceBand?: PriceBandMarkPrice
  /**
   * Futures price band. Used to determine how far the premium is allowed to
   * deviate from the mean premium.
   */
  meanPremiumBand?: PriceBandMeanPremium
  /**
   * Maximum allowed multiplier move from last active price without incurring
   * an entry fee for spot margin.
   */
  borrowEntryFeeMaxMultiplier?: string
  /**
   * Minimum allowed multiplier move from last active price without incurring
   * an entry fee for spot margin.
   */
  borrowEntryFeeMinMultiplier?: string
}

/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PriceFilter } from './PriceFilter'
import type { QuantityFilter } from './QuantityFilter'

export type OrderBookFilters = {
  /**
   * Defines the price rules for the order book.
   */
  price: PriceFilter
  /**
   * Defines the quantity rules for the order book.
   */
  quantity: QuantityFilter
}

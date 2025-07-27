/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { OrderStatus } from './OrderStatus'

export type Quote = {
  /**
   * Unique RFQ order ID, assigned by the matching engine.
   */
  rfqId: string
  /**
   * Unique RFQ quote ID, assigned by the matching engine.
   */
  quoteId: string
  /**
   * Custom RFQ quote ID, assigned by the maker (optionally).
   */
  clientId?: number
  /**
   * Quote bid price.
   */
  bidPrice: string
  /**
   * Quote ask price.
   */
  askPrice: string
  /**
   * Status.
   */
  status: OrderStatus
  /**
   * Time the quote was created.
   */
  createdAt: number
}

/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { OrderStatus } from './OrderStatus'
import type { RfqExecutionMode } from './RfqExecutionMode'
import type { Side } from './Side'

export type RequestForQuote = {
  /**
   * Unique RFQ order ID, assigned by the matching engine.
   */
  rfqId: string
  /**
   * Custom RFQ order ID, assigned by the user (optionally).
   */
  clientId?: number
  /**
   * Market symbol.
   */
  symbol: string
  /**
   * Side.
   */
  side: Side
  /**
   * RFQ price.
   * Price of the RFQ. Only when execution mode is `Immediate`.
   */
  price?: string
  /**
   * Quantity to fill (in base asset).
   */
  quantity?: string
  /**
   * Quantity to fill (in quote asset).
   */
  quoteQuantity?: string
  /**
   * Time (milliseconds since epoch) by which quotes must be submitted for
   * the RFQ.
   */
  submissionTime: number
  /**
   * Time (milliseconds since epoch) by which the RFQ expires if no match.
   */
  expiryTime: number
  /**
   * Status.
   */
  status: OrderStatus
  /**
   * RFQ execution mode.
   */
  executionMode: RfqExecutionMode
  /**
   * Time the RFQ was created.
   */
  createdAt: number
}

/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { RfqExecutionMode } from './RfqExecutionMode'
import type { Side } from './Side'

export type RequestForQuotePayload = {
  /**
   * Custom RFQ ID.
   */
  clientId?: number
  /**
   * RFQ quantity (in base asset).
   */
  quantity?: string
  /**
   * RFQ quote quantity (in quote asset).
   */
  quoteQuantity?: string
  /**
   * RFQ price. Only when execution mode is `Immediate`.
   */
  price?: string
  /**
   * RFQ symbol.
   */
  symbol: string
  /**
   * Side of the order.
   */
  side: Side
  /**
   * Execution mode. Defaults to `AwaitAccept` when not provided.
   */
  executionMode?: RfqExecutionMode
}

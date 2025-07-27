/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { BorrowLendEventType } from '../models/BorrowLendEventType'
import type { BorrowLendMovement } from '../models/BorrowLendMovement'
import type { BorrowLendPositionRow } from '../models/BorrowLendPositionRow'
import type { BorrowLendPositionState } from '../models/BorrowLendPositionState'
import type { BorrowLendSide } from '../models/BorrowLendSide'
import type { DustConversion } from '../models/DustConversion'
import type { FillType } from '../models/FillType'
import type { FundingPayment } from '../models/FundingPayment'
import type { InterestPayment } from '../models/InterestPayment'
import type { InterestPaymentSource } from '../models/InterestPaymentSource'
import type { MarketType } from '../models/MarketType'
import type { Order } from '../models/Order'
import type { OrderFill } from '../models/OrderFill'
import type { OrderStatus } from '../models/OrderStatus'
import type { PnlPayment } from '../models/PnlPayment'
import type { QuoteHistorical } from '../models/QuoteHistorical'
import type { RequestForQuoteHistorical } from '../models/RequestForQuoteHistorical'
import type { Settlement } from '../models/Settlement'
import type { SettlementSourceFilter } from '../models/SettlementSourceFilter'
import type { Side } from '../models/Side'
import type { SortDirection } from '../models/SortDirection'
import type { Strategy } from '../models/Strategy'

export class HistoryService {
  /**
   * Get borrow history.
   * History of borrow and lend operations for the account.
   *
   * **Instruction:** `borrowHistoryQueryAll`
   * @returns BorrowLendMovement Success.
   * @throws ApiError
   */
  public static getBorrowLendHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    type,
    sources,
    positionId,
    symbol,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to history for either borrows or lends.
     */
    type?: BorrowLendEventType
    /**
     * Filter to return history for a particular source. Can be a single
     * source, or multiple sources separated by commas.
     */
    sources?: string
    /**
     * Filter to return history for a borrow lend position.
     */
    positionId?: string
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<BorrowLendMovement>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/borrowLend',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        type: type,
        sources: sources,
        positionId: positionId,
        symbol: symbol,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get interest history.
   * History of the interest payments for borrows and lends for the account.
   *
   * **Instruction:** `interestHistoryQueryAll`
   * @returns InterestPayment Success.
   * @throws ApiError
   */
  public static getInterestHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    asset,
    symbol,
    positionId,
    limit,
    offset,
    source,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Asset to query. If not set, all assets are returned.
     */
    asset?: string
    /**
     * Market symbol to query. If not set, all markets are returned. If a
     * futures symbol is supplied, then interest payments on unrealized pnl
     * will be returned. Spot market symbols refer to interest payments on
     * regular borrow lend positions.
     */
    symbol?: string
    /**
     * Filter to return history for a borrow lend position.
     */
    positionId?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    /**
     * Filter to return interest payments of a particular source. Borrow
     * interest payments through two mechanisms: borrow lend
     * positions; interest paid on unrealized pnl.
     */
    source?: InterestPaymentSource
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<InterestPayment>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/interest',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        asset: asset,
        symbol: symbol,
        positionId: positionId,
        limit: limit,
        offset: offset,
        source: source,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get borrow position history.
   * History of borrow and lend positions for the account.
   *
   * **Instruction:** `borrowPositionHistoryQueryAll`
   * @returns BorrowLendPositionRow Success.
   * @throws ApiError
   */
  public static getBorrowLendPositionHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    symbol,
    side,
    state,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Return only borrows or only lends.
     */
    side?: BorrowLendSide
    /**
     * Return only open positions or closed positions.
     */
    state?: BorrowLendPositionState
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<BorrowLendPositionRow>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/borrowLend/positions',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        symbol: symbol,
        side: side,
        state: state,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get dust conversion history.
   * Retrieves the dust conversion history for the user.
   *
   * **Instruction:** `dustHistoryQueryAll`
   * @returns DustConversion Success.
   * @throws ApiError
   */
  public static getDustHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    id,
    symbol,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to a given dust conversion id.
     */
    id?: number
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<DustConversion>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/dust',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        id: id,
        symbol: symbol,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get fill history.
   * Retrieves historical fills, with optional filtering for a specific order
   * or symbol.
   *
   * **Instruction:** `fillHistoryQueryAll`
   * @returns OrderFill Success.
   * @throws ApiError
   */
  public static getFills({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    orderId,
    strategyId,
    from,
    to,
    symbol,
    limit,
    offset,
    fillType,
    marketType,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given order.
     */
    orderId?: string
    /**
     * Filter to the given strategy.
     */
    strategyId?: string
    /**
     * Filter to minimum time (milliseconds).
     */
    from?: number
    /**
     * Filter to maximum time (milliseconds).
     */
    to?: number
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Filter to return fills for different fill types
     */
    fillType?: FillType
    /**
     * Market type.
     */
    marketType?: Array<MarketType>
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<OrderFill>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/fills',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        orderId: orderId,
        strategyId: strategyId,
        from: from,
        to: to,
        symbol: symbol,
        limit: limit,
        offset: offset,
        fillType: fillType,
        marketType: marketType,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get funding payments.
   * Users funding payment history for futures.
   *
   * **Instruction:** `fundingHistoryQueryAll`
   * @returns FundingPayment Success.
   * @throws ApiError
   */
  public static getFundingPayments({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    subaccountId,
    symbol,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter for a subaccount.
     */
    subaccountId?: number
    /**
     * Market symbol to query. If not set, all markets are returned.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<FundingPayment>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/funding',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        subaccountId: subaccountId,
        symbol: symbol,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get order history.
   * Retrieves the order history for the user. This includes orders that have
   * been filled and are no longer on the book. It may include orders
   * that are on the book, but the `/orders` endpoint contains more up to
   * date data.
   *
   * **Instruction:** `orderHistoryQueryAll`
   * @returns Order Success.
   * @throws ApiError
   */
  public static getOrderHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    orderId,
    strategyId,
    symbol,
    limit,
    offset,
    marketType,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given order.
     */
    orderId?: string
    /**
     * Filter to the given strategy.
     */
    strategyId?: string
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Market type.
     */
    marketType?: Array<MarketType>
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<Order>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/orders',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        orderId: orderId,
        strategyId: strategyId,
        symbol: symbol,
        limit: limit,
        offset: offset,
        marketType: marketType,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get profit and loss history.
   * History of profit and loss realization for an account.
   *
   * **Instruction:** `pnlHistoryQueryAll`
   * @returns PnlPayment Success.
   * @throws ApiError
   */
  public static getPnlPayments({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    subaccountId,
    symbol,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter for a subaccount.
     */
    subaccountId?: number
    /**
     * Market symbol to query. If not set, all markets are returned.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<PnlPayment>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/pnl',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        subaccountId: subaccountId,
        symbol: symbol,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get rfq history.
   * Retrieves the rfq history for the user. This includes RFQs that have
   * been filled or expired.
   *
   * **Instruction:** `rfqHistoryQueryAll`
   * @returns RequestForQuoteHistorical Success.
   * @throws ApiError
   */
  public static getRfqHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    rfqId,
    symbol,
    status,
    side,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given rfq.
     */
    rfqId?: string
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Filter to the given status.
     */
    status?: OrderStatus
    /**
     * Filter to the given side.
     */
    side?: Side
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<RequestForQuoteHistorical>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/rfq',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        rfqId: rfqId,
        symbol: symbol,
        status: status,
        side: side,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get quote history.
   * Retrieves the quote history for the user. This includes quotes that have
   * been filled or expired.
   *
   * **Instruction:** `quoteHistoryQueryAll`
   * @returns QuoteHistorical Success.
   * @throws ApiError
   */
  public static getQuoteHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    quoteId,
    symbol,
    status,
    limit,
    offset,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given quote.
     */
    quoteId?: string
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Filter to the given status.
     */
    status?: OrderStatus
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<QuoteHistorical>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/quote',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        quoteId: quoteId,
        symbol: symbol,
        status: status,
        limit: limit,
        offset: offset,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get settlement history.
   * History of settlement operations for the account.
   *
   * **Instruction:** `settlementHistoryQueryAll`
   * @returns Settlement Success.
   * @throws ApiError
   */
  public static getSettlementHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    limit,
    offset,
    source,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
    source?: SettlementSourceFilter
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<Settlement>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/settlement',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        limit: limit,
        offset: offset,
        source: source,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get strategy history.
   * Retrieves the strategy history for the user. This returns strategies
   * that are no longer active as they have either been
   * completed, cancelled by the user or cancelled by the system.
   *
   * **Instruction:** `strategyHistoryQueryAll`
   * @returns Strategy Success.
   * @throws ApiError
   */
  public static getStrategiesHistory({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    strategyId,
    symbol,
    limit,
    offset,
    marketType,
    sortDirection,
  }: {
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Filter to the given strategy.
     */
    strategyId?: string
    /**
     * Filter to the given symbol.
     */
    symbol?: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
    /**
     * Market type.
     */
    marketType?: Array<MarketType>
    /**
     * Sort direction.
     */
    sortDirection?: SortDirection
  }): CancelablePromise<Array<Strategy>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/history/strategies',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        strategyId: strategyId,
        symbol: symbol,
        limit: limit,
        offset: offset,
        marketType: marketType,
        sortDirection: sortDirection,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
}

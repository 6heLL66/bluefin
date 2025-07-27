/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { Quote } from '../models/Quote'
import type { QuoteAcceptPayload } from '../models/QuoteAcceptPayload'
import type { QuotePayload } from '../models/QuotePayload'
import type { RequestForQuote } from '../models/RequestForQuote'
import type { RequestForQuoteCancelPayload } from '../models/RequestForQuoteCancelPayload'
import type { RequestForQuotePayload } from '../models/RequestForQuotePayload'
import type { RequestForQuoteRefreshPayload } from '../models/RequestForQuoteRefreshPayload'

export class RequestForQuoteService {
  /**
   * Submit RFQ.
   * Submit a Request for Quote (RFQ). The RFQ will be available for
   * a specified time window for makers to respond to.
   *
   * **Instruction:** `rfqSubmit`
   * @returns RequestForQuote Accepted.
   * @throws ApiError
   */
  public static submitRfq({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: RequestForQuotePayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<RequestForQuote> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/rfq',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Accept quote.
   * Accept a specific quote from a maker in response to an RFQ.
   *
   * **Instruction:** `quoteAccept`
   * @returns RequestForQuote Accepted.
   * @throws ApiError
   */
  public static acceptQuote({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: QuoteAcceptPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<RequestForQuote> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/rfq/accept',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Refresh RFQ.
   * Refresh a RFQ, extending the time window it is available for.
   *
   * **Instruction:** `rfqRefresh`
   * @returns RequestForQuote Accepted.
   * @throws ApiError
   */
  public static refreshRfq({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: RequestForQuoteRefreshPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<RequestForQuote> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/rfq/refresh',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Cancel RFQ.
   * **Instruction:** `rfqCancel`
   * @returns RequestForQuote Accepted.
   * @throws ApiError
   */
  public static cancelRfq({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: RequestForQuoteCancelPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<RequestForQuote> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/rfq/cancel',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Submit quote.
   * Submit a quote in response to an RFQ. If valid, the quote may be
   * accepted within the specified time window.
   *
   * **Instruction:** `quoteSubmit`
   * @returns Quote Accepted.
   * @throws ApiError
   */
  public static submitQuote({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: QuotePayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<Quote> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/rfq/quote',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrderCancelPayload = {
  /**
   * Client ID of the order.
   */
  clientId?: number
  /**
   * ID of the order.
   */
  orderId?: string
  /**
   * Market the order exists on.
   */
  symbol: string
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QuantityFilter = {
  /**
   * Minimum quantity the order book will allow.
   *
   * For futures, this will be the threshold at which a position gets closed
   * and so it should be as close as possible, preferably equal, to the
   * step_size.
   */
  minQuantity: string
  /**
   * Maximum quantity the order book will allow.
   */
  maxQuantity?: string
  /**
   * Quantity increment.
   */
  stepSize: string
}

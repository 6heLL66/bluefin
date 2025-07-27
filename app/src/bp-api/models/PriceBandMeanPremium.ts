/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PriceBandMeanPremium = {
  /**
   * Maximum allowed deviation from the mean premium. E.g. if
   * tolerance_pct is 0.05 (5%), and the mean premium is 5%, then
   * orders will be prevented from being placed if the premium exceeds 10%.
   */
  tolerancePct: string
}

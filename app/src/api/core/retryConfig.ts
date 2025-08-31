export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  maxRetryDelay: number
  retryMultiplier: number
  retryableStatuses: number[]
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 0,
  maxRetryDelay: 0,
  retryMultiplier: 0,
  retryableStatuses: [500, 502, 503, 504]
}

export const shouldRetry = (status: number, config: RetryConfig = defaultRetryConfig): boolean => {
  return config.retryableStatuses.includes(status)
}

export const getRetryDelay = (attempt: number, config: RetryConfig = defaultRetryConfig): number => {
  const delay = config.retryDelay * Math.pow(config.retryMultiplier, attempt)
  return Math.min(delay, config.maxRetryDelay)
}

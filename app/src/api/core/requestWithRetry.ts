import { CancelablePromise } from './CancelablePromise'
import type { OpenAPIConfig } from './OpenAPI'
import type { ApiRequestOptions } from './ApiRequestOptions'
import type { ApiResult } from './ApiResult'
import { getFormData, getRequestBody, getHeaders, sendRequest, getResponseHeader, getResponseBody, catchErrorCodes } from './request'
import { shouldRetry, getRetryDelay } from './retryConfig'

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
  const encoder = config.ENCODE_PATH || encodeURI

  const path = options.url.replace('{api-version}', config.VERSION).replace(/{(.*?)}/g, (substring: string, group: string) => {
    if (options.path?.hasOwnProperty(group)) {
      return encoder(String(options.path[group]))
    }
    return substring
  })

  const url = `${config.BASE}${path}`
  if (options.query) {
    return `${url}${getQueryString(options.query)}`
  }
  return url
}

const getQueryString = (params: Record<string, unknown>): string => {
  const qs: string[] = []

  const append = (key: string, value: unknown) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }

  const process = (key: string, value: unknown) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          process(key, v)
        })
      } else if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
          process(`${key}[${k}]`, v)
        })
      } else {
        append(key, value)
      }
    }
  }

  Object.entries(params).forEach(([key, value]) => {
    process(key, value)
  })

  if (qs.length > 0) {
    return `?${qs.join('&')}`
  }

  return ''
}

export const requestWithRetry = <T>(
  config: OpenAPIConfig, 
  options: ApiRequestOptions, 
  maxRetries: number = 3
): CancelablePromise<T> => {
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    let lastError: unknown
    let attempt = 0

    while (attempt <= maxRetries) {
      const url = getUrl(config, options)
      const formData = getFormData(options)
      const body = getRequestBody(options)
      const headers = await getHeaders(config, options)
      try {
        if (onCancel.isCancelled) {
          reject(new Error('Request cancelled'))
          return
        }

        const response = await sendRequest(config, options, url, body, formData, headers, onCancel)
        const responseBody = await getResponseBody(response)
        const responseHeader = getResponseHeader(response, options.responseHeader)

        const result: ApiResult = {
          url,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          body: responseHeader ?? responseBody,
        }

        if (shouldRetry(result.status) && attempt < maxRetries) {
          const retryDelay = getRetryDelay(attempt)
          console.warn(`Request failed with status ${result.status}, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`)
          
          await delay(retryDelay)
          attempt++
          continue
        }

        catchErrorCodes(options, result)
        resolve(result.body)
        return

      } catch (error) {
        lastError = error
        
        if (!url.includes('accounts/points') && attempt < maxRetries) {
          const retryDelay = getRetryDelay(attempt)
          console.warn(`Request failed with error: ${error}, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`)
          
          await delay(retryDelay)
          attempt++
          continue
        }
        
        reject(lastError)
        return
      }
    }
  })
}

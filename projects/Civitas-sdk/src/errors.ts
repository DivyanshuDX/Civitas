/**
 * Error from a non-OK HTTP response from the Venom API.
 */
export class VenomApiError extends Error {
  public readonly status: number
  public readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'VenomApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Error from a network/fetch failure (DNS, timeout, connection refused, etc.).
 */
export class VenomNetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VenomNetworkError'
  }
}

/**
 * Error from the transaction signing step.
 */
export class VenomSigningError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VenomSigningError'
  }
}

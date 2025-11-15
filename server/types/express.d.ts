import 'express'

declare module 'express' {
  interface Request {
    insist(permission: string, resource: string, id: string): void
    headers: {
      authorization?: string
    }
    correlation: {
      root?: string
      leaf?: string
    }
  }
}

// types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    idToken?: string    // ← rename to idToken
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string    // ← rename to idToken
  }
}

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// NextAuth configuration for Google authentication. It sets up the Google provider with client ID and secret from environment variables, and defines callbacks to include the ID token in the JWT and session objects for use in the application.
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      session.idToken = token.idToken as string 
      return session
    },
  },
})

export { handler as GET, handler as POST }

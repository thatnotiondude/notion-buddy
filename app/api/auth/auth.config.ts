import type { AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
} 
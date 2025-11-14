import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Ative debug para obter logs mais detalhados durante o desenvolvimento
  debug: process.env.NODE_ENV !== 'production',
  // Em dev, force cookies não seguros para evitar problemas com 'secure' flag
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    // opcional: você pode informar uma página de login personalizada
    // signIn: '/auth',
  },
})

export { handler as GET, handler as POST }

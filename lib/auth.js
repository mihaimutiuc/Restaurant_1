import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

// Custom adapter that allows account linking
const CustomPrismaAdapter = (p) => {
  const adapter = PrismaAdapter(p)
  
  return {
    ...adapter,
    // Override createUser to handle existing users
    createUser: async (data) => {
      // Check if user already exists
      const existingUser = await p.user.findUnique({
        where: { email: data.email }
      })
      
      if (existingUser) {
        // Update existing user with Google data - always update image and name from Google
        return await p.user.update({
          where: { email: data.email },
          data: {
            name: data.name || existingUser.name,
            image: data.image || existingUser.image,
            emailVerified: data.emailVerified || existingUser.emailVerified,
          }
        })
      }
      
      // Create new user
      return await p.user.create({ data })
    },
    // Override linkAccount to handle existing accounts
    linkAccount: async (data) => {
      // Check if account already exists
      const existingAccount = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: data.provider,
            providerAccountId: data.providerAccountId
          }
        }
      })
      
      if (existingAccount) {
        // Update existing account
        return await p.account.update({
          where: {
            provider_providerAccountId: {
              provider: data.provider,
              providerAccountId: data.providerAccountId
            }
          },
          data
        })
      }
      
      // Create new account link
      return await p.account.create({ data })
    }
  }
}

export const authOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email și parola sunt obligatorii")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("Email sau parolă incorectă")
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordCorrect) {
          throw new Error("Email sau parolă incorectă")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Dacă se loghează cu Google, actualizează imaginea și numele din profil
      if (account?.provider === 'google' && profile) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: profile.name || user.name,
              image: profile.picture || user.image,
            }
          })
        } catch (error) {
          console.error('Error updating user profile from Google:', error)
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {
        return baseUrl
      }
      return baseUrl
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
}

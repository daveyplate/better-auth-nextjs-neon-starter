import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { jwt } from "better-auth/plugins"

import { db } from "@/database/db"
import * as schema from "@/database/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        jwt({
            jwt: {
                definePayload: (session) => {
                    return {
                        id: session.user.id,
                        sub: session.user.id,
                        name: session.user.name,
                        email: session.user.email,
                        emailVerified: session.user.emailVerified,
                        image: session.user.image,
                        createdAt: session.user.createdAt,
                        updatedAt: session.user.updatedAt,
                        role: "authenticated"
                    }
                }
            },
            jwks: { keyPairConfig: { alg: "RS256" } }
        })
    ]
})

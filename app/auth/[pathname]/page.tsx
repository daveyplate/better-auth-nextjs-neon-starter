import { auth } from "@/lib/auth"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuthView } from "./view"

export function generateStaticParams() {
    return Object.values(authViewPaths).map((pathname) => ({ pathname }))
}

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
    const { pathname } = await params

    // SSR route protection for /auth/settings
    if (pathname === "settings") {
        const sessionData = await auth.api.getSession({ headers: await headers() })
        if (!sessionData) redirect("/auth/sign-in?redirectTo=/auth/settings")
    }

    return <AuthView pathname={pathname} />
}

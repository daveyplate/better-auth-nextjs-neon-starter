"use client"

import { useCallback, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function useToken() {
    const [token, setToken] = useState<string | null>()
    const [isPending, setIsPending] = useState<boolean>(true)
    const [error, setError] = useState<string | null>()
    const { data: sessionData } = authClient.useSession()

    const fetchToken = useCallback(async () => {
        if (!sessionData) {
            setToken(null)
            return
        }

        setIsPending(true)

        const { data, error } = await authClient.$fetch<{ token: string }>(
            "/token"
        )

        setError(error?.message)
        setToken(data?.token)

        setIsPending(false)
    }, [sessionData])

    useEffect(() => {
        fetchToken()
    }, [fetchToken])

    return {
        token,
        isPending,
        error,
        refetch: fetchToken
    }
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type UseTokenResult = {
    token: string | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

export function useToken(): UseTokenResult {
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const fetchToken = useCallback(async () => {
        try {
            if (isMountedRef.current) {
                setIsLoading(true)
                setError(null)
            }

            const res = await fetch("/api/auth/token", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            })

            if (!res.ok) {
                const text = await res.text().catch(() => "")
                throw new Error(text || `Request failed with ${res.status}`)
            }

            const data = (await res.json()) as { token?: string | null }
            if (isMountedRef.current) {
                setToken(data?.token ?? null)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error"
            if (isMountedRef.current) {
                setError(message)
                setToken(null)
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        fetchToken()
    }, [fetchToken])

    return {
        token,
        isLoading,
        error,
        refresh: fetchToken
    }
}

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    // async rewrites() {
    //     return [
    //         {
    //             source: "/api/postgrest/:path*",
    //             destination: `${process.env.NEXT_PUBLIC_DATA_API_URL!}/:path*`
    //         }
    //     ]
    // }
}

export default nextConfig

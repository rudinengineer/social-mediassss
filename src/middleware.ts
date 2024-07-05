import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { AUTH_PATH, PROTECTED_PATH, PUBLIC_PATH, ROOT_PATH } from "./lib/route"

// export const config = { matcher: ["/dashboard/", "/dashboard/:path*"] };

export default withAuth(
    function middleware(req) {
        if ( AUTH_PATH.includes(req.nextUrl.pathname) && !req.nextauth.token ) {
            return NextResponse.redirect(new URL('/signin', req.nextUrl))
        }
        if ( PROTECTED_PATH.includes(req.nextUrl.pathname) ) {
            if ( req.nextauth.token ) {
                return NextResponse.redirect(new URL(ROOT_PATH, req.nextUrl))
            }
        } else {
            if ( req.nextUrl.pathname !== ROOT_PATH && !PUBLIC_PATH.includes(req.nextUrl.pathname) && !req.nextauth.token ) {
                return NextResponse.redirect(new URL('/signin', req.nextUrl))
            }
        }
    },
    {
        secret: process.env.NEXT_AUTH_SECRET!,
    }
)

// export default withAuth(
//     {
//         callbacks: {
//             authorized({ token }) {
//                 if ( token ) {
//                     return true
//                 }
//                 return false
//             },
//         },
//         secret: process.env.NEXT_AUTH_SECRET!,
//         pages: {
//             signIn: '/signin',
//             newUser: '/signup',
//             signOut: '/auth/logout'
//         }
//     }
// )

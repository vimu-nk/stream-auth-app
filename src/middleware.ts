import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/public", "/login", "/register", "/api", "/favicon.ico"];

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const { pathname } = req.nextUrl;

	// Allow public paths
	const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
	if (isPublic) return NextResponse.next();

	// If no token and accessing a protected route, redirect to login
	if (!token) {
		const loginUrl = req.nextUrl.clone();
		loginUrl.pathname = "/login";
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*"],
};

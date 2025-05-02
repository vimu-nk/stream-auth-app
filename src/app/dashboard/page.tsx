"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NotificationPanel from "@/components/NotificationPanel";
import NICVerificationPanel from "@/components/NICVerificationPanel";
import { signOut } from "next-auth/react";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") return <p>Loading...</p>;

	interface User {
		firstName?: string;
		uniqueId?: string;
		verificationLevel?: number;
	}

	const user = session?.user as User;

	return (
		<div className="p-4">
			<div className="relative">
				<button
					onClick={() =>
						signOut({
							redirect: true,
							callbackUrl: "/login",
						})
					}
					className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded"
				>
					Logout
				</button>
			</div>
			<h1 className="text-2xl font-bold">
				Welcome, {user?.firstName || "User"}
			</h1>
			<p className="text-sm text-gray-600 mb-4">
				ID: {user?.uniqueId || "N/A"} | Verification Level:{" "}
				{user?.verificationLevel || "N/A"}
			</p>

			<NotificationPanel />

			{(user?.verificationLevel ?? 0) < 2 && (
				<NICVerificationPanel
					currentLevel={user?.verificationLevel ?? 0}
				/>
			)}
		</div>
	);
}

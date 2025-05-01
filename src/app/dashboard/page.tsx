"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NotificationPanel from "@/components/NotificationPanel";
import NICVerificationPanel from "@/components/NICVerificationPanel";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") return <p>Loading...</p>;

	const user = session?.user as any;

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">
				Welcome, {user?.firstName || "User"}
			</h1>
			<p className="text-sm text-gray-600 mb-4">
				ID: {user?.uniqueId || "N/A"} | Verification Level:{" "}
				{user?.verificationLevel || "N/A"}
			</p>

			<NotificationPanel />

			{user?.verificationLevel < 2 && (
				<NICVerificationPanel currentLevel={user?.verificationLevel} />
			)}

			<pre>{JSON.stringify(session?.user, null, 2)}</pre>
		</div>
	);
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NotificationPanel from "@/components/NotificationPanel";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status]);

	if (status === "loading") return <p>Loading...</p>;

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">
				Welcome, {session?.user?.firstName || "User"}
			</h1>
			<p className="text-sm text-gray-600">
				Your ID: {session?.user?.uniqueId || "N/A"}
			</p>
			<NotificationPanel />
		</div>
	);
}

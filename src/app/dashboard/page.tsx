"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
		<div className="max-w-xl mx-auto mt-10 text-center">
			<h1 className="text-2xl font-bold">
				Welcome, {session?.user?.email || session?.user?.phone}
			</h1>
		</div>
	);
}

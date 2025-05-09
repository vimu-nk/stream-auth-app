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

	if (status === "loading") {
		return (
			<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
				<div className="text-[#F0F0F0] text-xl">Loading...</div>
			</div>
		);
	}

	interface User {
		firstName?: string;
		uniqueId?: string;
		verificationLevel?: number;
	}

	const user = session?.user as User;

	return (
		<div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center px-4 py-10 text-[#F0F0F0]">
			<div className="w-full max-w-6xl">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">
						Welcome, {user?.firstName || "User"}
					</h1>
					<button
						onClick={() =>
							signOut({
								redirect: true,
								callbackUrl: "/login",
							})
						}
						className="bg-[#FF3B3F] hover:bg-[#e02d31] text-[#F0F0F0] px-5 py-2 rounded-lg transition"
					>
						Logout
					</button>
				</div>

				<div className="bg-[#1A1A1A] rounded-2xl p-8 mb-6">
					<div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
						<div>
							<h2 className="text-xl font-semibold mb-2">
								User Information
							</h2>
							<p className="text-[#AAABB8]">
								View and manage your account details
							</p>
						</div>
						<div className="mt-4 md:mt-0 px-5 py-3 bg-[#0D0D0D] rounded-lg border border-[#2a2a2a]">
							<div className="flex flex-col">
								<span className="text-sm text-[#AAABB8]">
									Student ID
								</span>
								<span className="font-mono font-medium text-[#1E90FF]">
									{user?.uniqueId || "N/A"}
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-[#151515] p-5 rounded-xl border border-[#2a2a2a]">
							<h3 className="text-lg font-medium mb-2">
								Verification Status
							</h3>
							<div className="flex items-center gap-3">
								<div
									className={`w-3 h-3 rounded-full ${
										(user?.verificationLevel || 0) >= 1
											? "bg-[#00C896]"
											: "bg-[#AAABB8]"
									}`}
								/>
								<span className="text-sm">
									Level {user?.verificationLevel || "0"}{" "}
									Verification
								</span>
							</div>
						</div>

						<div className="bg-[#151515] p-5 rounded-xl border border-[#2a2a2a]">
							<h3 className="text-lg font-medium mb-2">
								Account Status
							</h3>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-[#00C896]" />
								<span className="text-sm">Active</span>
							</div>
						</div>
					</div>
				</div>

				{(user?.verificationLevel ?? 0) < 2 && (
					<div className="mb-6">
						<NICVerificationPanel
							currentLevel={user?.verificationLevel ?? 0}
						/>
					</div>
				)}

				<div className="mb-6">
					<NotificationPanel />
				</div>
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Import signIn function
import Toast from "@/components/Toast";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState(""); // Can be email or phone
	const [password, setPassword] = useState("");
	const [toastMessage, setToastMessage] = useState("");
	const [toastType, setToastType] = useState<"success" | "error">("success");
	const [isLoading, setIsLoading] = useState(false); // Add loading state
	const router = useRouter();

	const handleCloseToast = () => setToastMessage("");

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Use NextAuth's signIn method instead of custom fetch
			const result = await signIn("credentials", {
				identifier,
				password,
				redirect: false,
			});

			if (result?.error) {
				setToastMessage(result.error || "Invalid credentials");
				setToastType("error");
				setIsLoading(false);
				return;
			}

			// Success case
			setToastMessage("Login successful! Redirecting...");
			setToastType("success");

			// Redirect to dashboard
			router.push("/dashboard");
			router.refresh(); // Force refresh to ensure session is updated
		} catch {
			setToastMessage("An error occurred. Please try again.");
			setToastType("error");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-10 text-[#F2F2F2]">
			<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Branding/Description Section */}
				<div className="hidden md:flex flex-col justify-center bg-[#1A1A1A] p-10 rounded-2xl">
					<h2 className="text-4xl font-bold text-[#F2F2F2] mb-4">
						Welcome Back
					</h2>
					<p className="text-[#AAABB8]">
						Log in to access your account and continue where you
						left off.
					</p>
				</div>

				{/* Login Form Section */}
				<div className="bg-[#1A1A1A] rounded-2xl p-8">
					<h1 className="text-2xl font-bold text-center mb-4">
						Login
					</h1>
					<form onSubmit={handleLogin} className="space-y-4">
						<input
							type="text"
							placeholder="Email or Phone"
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
							required
							disabled={isLoading}
						/>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
							required
							disabled={isLoading}
						/>
						<button
							type="submit"
							className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-2 rounded-lg transition disabled:bg-[#0056b3] disabled:opacity-70"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Log In"}
						</button>
					</form>
					<p className="text-sm text-center text-[#AAABB8] mt-4">
						Don&apos;t have an account?{" "}
						<a
							href="/register"
							className="text-[#007BFF] hover:underline"
						>
							Register here
						</a>
					</p>
				</div>
			</div>

			{/* Toast Component */}
			{toastMessage && (
				<Toast
					message={toastMessage}
					type={toastType}
					onClose={handleCloseToast}
				/>
			)}
		</div>
	);
}

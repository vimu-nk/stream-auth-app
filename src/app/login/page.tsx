"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthCredentials } from "@/context/AuthCredentialContext";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [showOtpPrompt, setShowOtpPrompt] = useState(false);
	const [error, setError] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const router = useRouter();
	const [resendTimer, setResendTimer] = useState(0);
	const { setCredentials } = useAuthCredentials();

	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [resendTimer]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setStatusMessage("");

		const res = await signIn("credentials", {
			identifier,
			password,
			redirect: false,
		});

		if (res?.ok) {
			setCredentials(identifier, password);
			router.push("/dashboard");
		} else if (res?.error === "PHONE_NOT_VERIFIED") {
			setShowOtpPrompt(true);
			const resendRes = await fetch("/api/auth/resend-otp", {
				method: "POST",
				body: JSON.stringify({ phone: identifier }),
				headers: { "Content-Type": "application/json" },
			});

			const data = await resendRes.json();

			if (resendRes.ok) {
				setStatusMessage(
					"Phone not verified. OTP sent to your number."
				);
				setResendTimer(30);
			} else {
				setStatusMessage(data.error || "Failed to send OTP.");
			}
		} else {
			setError("Invalid credentials or login failed.");
		}
	};

	const handleOtpVerify = async () => {
		const res = await fetch("/api/auth/verify-otp", {
			method: "POST",
			body: JSON.stringify({ phone: identifier, code: otp }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setCredentials(identifier, password);
			setStatusMessage("Phone verified. Logging you in...");
			const loginRes = await signIn("credentials", {
				identifier,
				password,
				redirect: false,
			});
			if (loginRes?.ok) {
				router.push("/dashboard");
			} else {
				setError("Login failed after verification.");
			}
		} else {
			setError(data.error || "Invalid OTP");
		}
	};

	const resendOTP = async () => {
		setStatusMessage("");
		const res = await fetch("/api/auth/resend-otp", {
			method: "POST",
			body: JSON.stringify({ phone: identifier }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setStatusMessage("OTP resent successfully");
			setResendTimer(30);
		} else {
			setStatusMessage(data.error || "Failed to resend OTP");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 space-y-4">
			<h1 className="text-2xl font-bold">Login</h1>
			{error && <p className="text-red-500">{error}</p>}
			{statusMessage && (
				<p className="text-sm text-gray-600">{statusMessage}</p>
			)}

			{!showOtpPrompt ? (
				<form onSubmit={handleLogin} className="space-y-4">
					<input
						type="text"
						placeholder="Email or Phone"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						required
						className="w-full p-2 border rounded"
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full p-2 border rounded"
					/>
					<button
						type="submit"
						className="bg-green-600 text-white px-4 py-2 rounded"
					>
						Login
					</button>
				</form>
			) : (
				<div className="space-y-4">
					<input
						type="text"
						placeholder="Enter OTP"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						className="w-full p-2 border rounded"
					/>
					<button
						onClick={handleOtpVerify}
						className="bg-blue-600 text-white px-4 py-2 rounded"
					>
						Verify OTP & Login
					</button>
					<button
						onClick={resendOTP}
						className="text-blue-600 text-sm underline disabled:opacity-40"
						disabled={resendTimer > 0}
					>
						{resendTimer > 0
							? `Resend in ${resendTimer}s`
							: "Resend Code"}
					</button>
				</div>
			)}
		</div>
	);
}

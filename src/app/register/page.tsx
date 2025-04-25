"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"form" | "otp">("form");
	const [userId, setUserId] = useState("");
	const [error, setError] = useState("");
	const [resendStatus, setResendStatus] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [resendTimer]);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const res = await fetch("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({ email, password, phone }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setUserId(data.userId);
			setStep("otp");
			setResendTimer(30);
		} else {
			setError(data.error || "Registration failed");
		}
	};

	const verifyOTP = async () => {
		const res = await fetch("/api/auth/verify-otp", {
			method: "POST",
			body: JSON.stringify({ phone, code: otp }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			router.push("/login");
		} else {
			setError(data.error || "Invalid OTP");
		}
	};

	const resendOTP = async () => {
		setResendStatus("");
		const res = await fetch("/api/auth/resend-otp", {
			method: "POST",
			body: JSON.stringify({ phone }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setResendStatus("OTP resent successfully");
			setResendTimer(30);
		} else {
			setResendStatus(data.error || "Failed to resend OTP");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 space-y-4">
			<h1 className="text-2xl font-bold">Register</h1>
			{error && <p className="text-red-500">{error}</p>}

			{step === "form" ? (
				<form onSubmit={handleRegister} className="space-y-4">
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full p-2 border rounded"
					/>
					<input
						type="tel"
						placeholder="Phone (7XXXXXXXX)"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
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
						className="bg-blue-600 text-white px-4 py-2 rounded"
					>
						Register
					</button>
				</form>
			) : (
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						Enter the OTP sent to {phone}
					</p>
					<input
						type="text"
						placeholder="Enter OTP"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						className="w-full p-2 border rounded"
					/>
					<button
						onClick={verifyOTP}
						className="bg-green-600 text-white px-4 py-2 rounded"
					>
						Verify OTP
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
					{resendStatus && (
						<p className="text-sm text-gray-500">{resendStatus}</p>
					)}
				</div>
			)}
		</div>
	);
}

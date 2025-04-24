"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await signIn("credentials", {
			identifier,
			password,
			redirect: false,
		});

		if (res?.ok) {
			router.push("/dashboard");
		} else {
			setError("Invalid credentials or phone not verified");
		}
	};

	return (
		<form
			onSubmit={handleLogin}
			className="max-w-md mx-auto mt-10 space-y-4"
		>
			<h1 className="text-2xl font-bold">Login</h1>
			{error && <p className="text-red-500">{error}</p>}
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
			<button className="bg-green-600 text-white px-4 py-2 rounded">
				Login
			</button>
		</form>
	);
}

"use client";

import { useState } from "react";
import { useAuthCredentials } from "@/context/AuthCredentialContext";
import { signIn } from "next-auth/react";

export default function NICVerificationPanel({
	currentLevel,
}: {
	currentLevel: number;
}) {
	const [front, setFront] = useState<File | null>(null);
	const [back, setBack] = useState<File | null>(null);
	const [status, setStatus] = useState("");
	const [nicMismatch, setNicMismatch] = useState(false);
	const [extractedNIC, setExtractedNIC] = useState("");
	const [manualNIC, setManualNIC] = useState("");
	const [verified, setVerified] = useState(currentLevel === 2);
	const { identifier, password } = useAuthCredentials();

	const handleVerify = async () => {
		if (!front || !back) {
			setStatus("Please upload both images.");
			return;
		}

		const formData = new FormData();
		formData.append("front", front);
		formData.append("back", back);

		const res = await fetch("/api/user/verify-nic", {
			method: "POST",
			body: formData,
		});

		const data = await res.json();

		if (res.ok && data.verified) {
			setVerified(true);
			setStatus("✅ Verified. Reloading...");
			await signIn("credentials", {
				identifier,
				password,
				redirect: true,
				callbackUrl: "/dashboard",
			});
		} else if (res.ok && data.nicMismatch) {
			setNicMismatch(true);
			setExtractedNIC(data.extractedNIC || "");
			setManualNIC(data.extractedNIC || "");
			setStatus("NIC number mismatch. Please confirm or correct.");
		} else {
			setStatus(`❌ ${data.error}`);
		}
	};

	const handleNICUpdate = async () => {
		if (!/^\d{12}$/.test(manualNIC)) {
			setStatus("NIC must be 12 digits.");
			return;
		}

		const res = await fetch("/api/user/update-nic", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ correctedNIC: manualNIC }),
		});

		const data = await res.json();

		if (res.ok) {
			setStatus("NIC updated. Please re-upload images.");
			setNicMismatch(false);
			setFront(null);
			setBack(null);
			setExtractedNIC("");
		} else {
			setStatus(`❌ ${data.error}`);
		}
	};

	if (verified) return null;

	return (
		<div className="p-4 bg-white rounded shadow space-y-4">
			<h2 className="text-lg font-semibold">NIC Verification</h2>

			<input
				type="file"
				accept="image/*"
				onChange={(e) => setFront(e.target.files?.[0] || null)}
			/>
			<label className="text-sm">NIC Front</label>

			<input
				type="file"
				accept="image/*"
				onChange={(e) => setBack(e.target.files?.[0] || null)}
			/>
			<label className="text-sm">NIC Back</label>

			<button
				onClick={handleVerify}
				className="bg-blue-600 text-white px-4 py-2 rounded"
			>
				Verify NIC
			</button>

			{nicMismatch && (
				<div className="space-y-2">
					<p className="text-sm text-yellow-700">
						Extracted NIC: <strong>{extractedNIC}</strong>
					</p>
					<input
						type="text"
						value={manualNIC}
						onChange={(e) => setManualNIC(e.target.value)}
						className="w-full p-2 border rounded"
						placeholder="Enter correct NIC number"
					/>
					<button
						onClick={handleNICUpdate}
						className="bg-green-600 text-white px-4 py-2 rounded"
					>
						Confirm & Update
					</button>
				</div>
			)}

			{status && <p className="text-sm mt-2">{status}</p>}
		</div>
	);
}

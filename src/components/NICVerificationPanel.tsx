"use client";

import { useState } from "react";
import { useAuthCredentials } from "@/context/AuthCredentialContext";
import { signIn, useSession } from "next-auth/react";

interface NICVerificationPanelProps {
	currentLevel: number;
}

export default function NICVerificationPanel({
	currentLevel,
}: NICVerificationPanelProps) {
	const [frontFile, setFrontFile] = useState<File | null>(null);
	const [backFile, setBackFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState<"success" | "error">(
		"success"
	);
	const { data: session } = useSession();
	// Get the stored auth credentials for auto re-signin
	const { identifier, password } = useAuthCredentials();

	// If user is already verified (level 2), don't render the panel
	if (currentLevel >= 2) {
		return null;
	}

	const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFrontFile(e.target.files[0]);
		}
	};

	const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setBackFile(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!frontFile || !backFile) {
			setMessage("Please select both front and back images of your NIC");
			setMessageType("error");
			return;
		}

		if (!session?.user) {
			setMessage("You must be logged in to verify your identity");
			setMessageType("error");
			return;
		}

		setUploading(true);
		setMessage("");

		// Create a FormData object to send both files
		const formData = new FormData();
		formData.append("front", frontFile);
		formData.append("back", backFile);

		try {
			const response = await fetch("/api/verification/upload-nic", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("Verification failed:", data);
				throw new Error(data.error || "Upload failed");
			}

			if (data.nicMismatch) {
				setMessage("NIC number mismatch. Please check and try again.");
				setMessageType("error");
			} else if (data.verified) {
				setMessage(
					"ID verified successfully! Your account has been upgraded."
				);
				setMessageType("success");

				if (data.autoReLogin && identifier && password) {
					try {
						setUploading(true);
						setMessage(
							"Verification successful! Refreshing your session..."
						);
						await signIn("credentials", {
							identifier,
							password,
							redirect: false,
						});
						window.location.reload(); // Ensure session updates
					} catch (error) {
						console.error(
							"Error during authentication refresh:",
							error
						);
						setMessage(
							"Verification successful, but session refresh failed. Please log out and log in again."
						);
					} finally {
						setUploading(false);
					}
				} else {
					setMessage(
						"Verification successful! Please log out and log in again to see the changes."
					);
					setTimeout(() => window.location.reload(), 2000);
				}
			}

			setFrontFile(null);
			setBackFile(null);

			// Reset the file inputs
			const frontFileInput = document.getElementById(
				"nicFrontFile"
			) as HTMLInputElement;
			const backFileInput = document.getElementById(
				"nicBackFile"
			) as HTMLInputElement;
			if (frontFileInput) frontFileInput.value = "";
			if (backFileInput) backFileInput.value = "";
		} catch (error) {
			setMessage(
				error instanceof Error ? error.message : "Upload failed"
			);
			setMessageType("error");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="bg-[#1A1A1A] rounded-2xl p-8">
			<div className="mb-4">
				<h2 className="text-xl font-semibold text-[#F0F0F0]">
					ID Verification
				</h2>
				<p className="text-[#AAABB8] mt-1">
					Upload your NIC to verify your identity and unlock
					additional features
				</p>
			</div>

			<div className="bg-[#151515] rounded-xl p-6 border border-[#2a2a2a]">
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="nicFrontFile"
							className="block text-[#AAABB8] text-sm mb-2"
						>
							Upload the front side of your National Identity Card
						</label>
						<input
							type="file"
							id="nicFrontFile"
							accept="image/*"
							onChange={handleFrontFileChange}
							className="block w-full text-sm text-[#AAABB8] file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-medium
              file:bg-[#7A5FFF] file:text-white hover:file:bg-[#6a52e5]"
						/>
						{frontFile && (
							<p className="mt-2 text-sm text-[#AAABB8]">
								Front side: {frontFile.name}
							</p>
						)}
					</div>

					<div className="mb-4">
						<label
							htmlFor="nicBackFile"
							className="block text-[#AAABB8] text-sm mb-2"
						>
							Upload the back side of your National Identity Card
						</label>
						<input
							type="file"
							id="nicBackFile"
							accept="image/*"
							onChange={handleBackFileChange}
							className="block w-full text-sm text-[#AAABB8] file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-medium
              file:bg-[#7A5FFF] file:text-white hover:file:bg-[#6a52e5]"
						/>
						{backFile && (
							<p className="mt-2 text-sm text-[#AAABB8]">
								Back side: {backFile.name}
							</p>
						)}
					</div>

					{message && (
						<div
							className={`p-3 rounded-lg mb-4 ${
								messageType === "success"
									? "bg-[#00C896]/10 text-[#00C896]"
									: "bg-[#FF3B3F]/10 text-[#FF3B3F]"
							}`}
						>
							{message}
						</div>
					)}
					<button
						type="submit"
						className="bg-[#1E90FF] hover:bg-[#1a7ad9] text-[#F0F0F0] px-4 py-2 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
						disabled={uploading}
					>
						{uploading ? "Uploading..." : "Verify Identity"}
					</button>
				</form>
			</div>
		</div>
	);
}

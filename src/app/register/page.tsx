"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressPicker from "@/components/AddressPicker";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";

export default function RegisterPage() {
	const [step, setStep] = useState<"phone" | "otp" | "form1" | "form2">(
		"phone"
	);
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [nic, setNic] = useState("");
	const [gender, setGender] = useState("");
	const [birthday, setBirthday] = useState("");
	const [email, setEmail] = useState("");
	const [whatsapp, setWhatsapp] = useState("");
	const [password, setPassword] = useState("");
	const [alYear, setAlYear] = useState("");
	const [institute, setInstitute] = useState("");
	const [medium, setMedium] = useState("");
	const [uAddress, setUAddress] = useState("");
	const [mapAddress, setMapAddress] = useState("");
	const [district, setDistrict] = useState("");
	const [toastMessage, setToastMessage] = useState("");
	const [toastType, setToastType] = useState<"success" | "error">("success");
	const router = useRouter();

	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [resendTimer]);

	const sendOTP = async () => {
		const res = await fetch("/api/auth/send-otp", {
			method: "POST",
			body: JSON.stringify({ phone }),
			headers: { "Content-Type": "application/json" },
		});
		const data = await res.json();
		if (res.ok) {
			setToastType("success");
			setToastMessage("OTP sent to your number");
			setResendTimer(30);
			setStep("otp");
		} else {
			setToastType("error");
			setToastMessage(data.error || "Failed to resend OTP");
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
			setToastType("success");
			setToastMessage("Phone verified successfully");
			setStep("form1");
		} else {
			setToastType("error");
			setToastMessage(data.error || "Invalid OTP");
		}
	};

	const resendOTP = async () => {
		const res = await fetch("/api/auth/resend-otp", {
			method: "POST",
			body: JSON.stringify({ phone }),
			headers: { "Content-Type": "application/json" },
		});
		const data = await res.json();
		if (res.ok) {
			setToastType("success");
			setToastMessage("OTP resent successfully");
			setResendTimer(30);
		} else {
			setToastType("error");
			setToastMessage(data.error || "Failed to resend OTP");
		}
	};

	const handleCompleteRegistration = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await fetch("/api/auth/complete-registration", {
			method: "POST",
			body: JSON.stringify({
				phone,
				firstName,
				lastName,
				alYear,
				nic,
				gender,
				birthday,
				whatsapp,
				uAddress,
				mapAddress,
				district,
				email,
				password,
				institute,
				medium,
			}),
			headers: { "Content-Type": "application/json" },
		});
		const data = await res.json();
		if (res.ok) {
			setToastType("success");
			setToastMessage("Registration completed successfully!");
			setTimeout(() => router.push("/login"), 2000);
		} else {
			setToastType("error");
			setToastMessage(data.error || "Registration failed");
		}
	};

	const handleNicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNic(value);
		if (value.length === 12) {
			const year = parseInt(value.substring(0, 4));
			let dayNumber = parseInt(value.substring(4, 7));
			let genderDetected = "Male";
			if (dayNumber >= 500) {
				dayNumber -= 500;
				genderDetected = "Female";
			}
			const birthDate = new Date(year, 0);
			birthDate.setDate(dayNumber);
			setGender(genderDetected);
			setBirthday(birthDate.toISOString().split("T")[0]);
		} else {
			setGender("");
			setBirthday("");
		}
	};

	const validateEmail = async () => {
		if (!email) {
			setToastType("error");
			setToastMessage("Email is required");
			return false;
		}

		try {
			const res = await fetch("/api/auth/check-email", {
				method: "POST",
				body: JSON.stringify({ email }),
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();

			if (!res.ok) {
				setToastType("error");
				setToastMessage(data.error || "Failed to validate email");
				return false;
			}

			return true;
		} catch {
			setToastType("error");
			setToastMessage("An error occurred while validating email");
			return false;
		}
	};

	return (
		<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-10 text-[#F2F2F2]">
			<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="hidden md:flex flex-col justify-center bg-[#1A1A1A] p-10 rounded-2xl">
					<h2 className="text-4xl font-bold text-[#F2F2F2] mb-4">
						COMBINED MAX
					</h2>
					<p className="text-[#AAABB8]">
						Register to get started with our platform. We’ll guide
						you every step of the way.
					</p>
				</div>
				<div className="bg-[#1A1A1A] rounded-2xl p-8">
					<h1 className="text-2xl font-bold text-center mb-4">
						Register
					</h1>
					{toastMessage && (
						<Toast
							message={toastMessage}
							type={toastType}
							onClose={() => setToastMessage("")}
						/>
					)}
					<AnimatePresence mode="wait">
						<motion.div
							key={step}
							exit={{ opacity: 0, x: -20 }}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							{step === "phone" && (
								<div className="space-y-4">
									<input
										type="tel"
										placeholder="Phone Number"
										value={phone}
										onChange={(e) =>
											setPhone(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<button
										onClick={sendOTP}
										className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-2 rounded-lg transition"
									>
										Send OTP
									</button>
								</div>
							)}
							{step === "otp" && (
								<div className="space-y-4">
									<input
										type="text"
										placeholder="Enter OTP"
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<button
										onClick={verifyOTP}
										className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-2 rounded-lg transition"
									>
										Verify OTP
									</button>
									<button
										onClick={resendOTP}
										disabled={resendTimer > 0}
										className="w-full text-sm text-[#AAABB8] underline disabled:opacity-40"
									>
										{resendTimer > 0
											? `Resend in ${resendTimer}s`
											: "Resend Code"}
									</button>
								</div>
							)}
							{step === "form1" && (
								<div className="space-y-4">
									<input
										type="text"
										placeholder="First Name"
										value={firstName}
										onChange={(e) =>
											setFirstName(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<input
										type="text"
										placeholder="Last Name"
										value={lastName}
										onChange={(e) =>
											setLastName(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<input
										type="text"
										placeholder="NIC Number"
										value={nic}
										onChange={handleNicChange}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<input
										type="text"
										placeholder="Gender"
										value={gender}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										readOnly
									/>
									<input
										type="text"
										placeholder="Birthday"
										value={birthday}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										readOnly
									/>
									<input
										type="email"
										placeholder="Email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<input
										type="tel"
										placeholder="WhatsApp Number"
										value={whatsapp}
										onChange={(e) =>
											setWhatsapp(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<input
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<button
										onClick={async () => {
											const isEmailValid =
												await validateEmail();
											if (isEmailValid) {
												setStep("form2");
											}
										}}
										className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-2 rounded-lg transition"
									>
										Next
									</button>
								</div>
							)}

							{step === "form2" && (
								<div className="space-y-4">
									<select
										value={alYear}
										onChange={(e) =>
											setAlYear(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									>
										<option value="" disabled hidden>
											Select A/L Year
										</option>
										<option value="2025 AL">2025 AL</option>
										<option value="2026 AL">2026 AL</option>
										<option value="2027 AL">2027 AL</option>
									</select>
									<select
										value={institute}
										onChange={(e) =>
											setInstitute(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									>
										<option value="" disabled hidden>
											Select Institute
										</option>
										<option value="SyZyGy - Nugegoda">
											SyZyGy - Nugegoda
										</option>
										<option value="SyZyGy - Gampaha">
											SyZyGy - Gampaha
										</option>
										<option value="iSM - Nugegoda">
											iSM - Nugegoda
										</option>
										<option value="Wales - Moratuwa">
											Wales - Moratuwa
										</option>
										<option value="Sarva - Panadura">
											Sarva - Panadura
										</option>
										<option value="Sigma - Kirulapone">
											Sigma - Kirulapone
										</option>
									</select>
									<select
										value={medium}
										onChange={(e) =>
											setMedium(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									>
										<option value="" disabled hidden>
											Select Medium
										</option>
										<option value="Sinhala Medium">
											Sinhala Medium
										</option>
										<option value="English Medium">
											English Medium
										</option>
									</select>
									<input
										type="text"
										placeholder="Your Home Address"
										value={uAddress}
										onChange={(e) =>
											setUAddress(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									/>
									<div>
										{/* Placeholder above the map */}
										<p className="text-sm text-[#AAABB8] mb-2">
											Pick your address on the map:
										</p>
										<AddressPicker
											onAddressSelect={(addr) =>
												setMapAddress(addr)
											}
										/>
										{/* Display the fetched address */}
										{mapAddress && (
											<p className="mt-2 text-sm text-[#AAABB8]">
												Selected Address: {mapAddress}
											</p>
										)}
									</div>
									<select
										value={district}
										onChange={(e) =>
											setDistrict(e.target.value)
										}
										className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded-lg border border-[#AAABB8]"
										required
									>
										<option value="" disabled hidden>
											Select District
										</option>
										{[
											"Colombo",
											"Gampaha",
											"Kalutara",
											"Kandy",
											"Matale",
											"Nuwara Eliya",
											"Galle",
											"Matara",
											"Hambantota",
											"Kurunegala",
											"Puttalam",
											"Anuradhapura",
											"Polonnaruwa",
											"Ratnapura",
											"Kegalle",
											"Badulla",
											"Monaragala",
											"Trincomalee",
											"Batticaloa",
											"Ampara",
											"Jaffna",
											"Kilinochchi",
											"Vavuniya",
											"Mannar",
											"Mullaitivu",
										].map((d) => (
											<option key={d} value={d}>
												{d}
											</option>
										))}
									</select>
									<button
										onClick={handleCompleteRegistration}
										className="w-full bg-[#28a745] hover:bg-[#218838] text-white py-2 rounded-lg transition"
									>
										Complete Registration
									</button>
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

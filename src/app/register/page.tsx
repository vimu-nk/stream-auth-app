"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressPicker from "@/components/AddressPicker";

export default function RegisterPage() {
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"phone" | "otp" | "form">("phone");
	const [error, setError] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [alYear, setAlYear] = useState("");
	const [nic, setNic] = useState("");
	const [gender, setGender] = useState("");
	const [birthday, setBirthday] = useState("");
	const [whatsapp, setWhatsapp] = useState("");
	const [address, setAddress] = useState("");
	const [district, setDistrict] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
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
		setError("");
		const res = await fetch("/api/auth/send-otp", {
			method: "POST",
			body: JSON.stringify({ phone }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setStatusMessage("OTP sent to your number");
			setResendTimer(30);
			setStep("otp");
		} else {
			setError(data.error || "Failed to send OTP");
		}
	};

	const verifyOTP = async () => {
		setError("");
		const res = await fetch("/api/auth/verify-otp", {
			method: "POST",
			body: JSON.stringify({ phone, code: otp }),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (res.ok) {
			setStatusMessage("Phone verified successfully.");
			setStep("form"); // Move to full registration form next
		} else {
			setError(data.error || "Invalid OTP");
		}
	};

	const resendOTP = async () => {
		setStatusMessage("");
		const res = await fetch("/api/auth/resend-otp", {
			method: "POST",
			body: JSON.stringify({ phone }),
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

	const handleCompleteRegistration = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setStatusMessage("");

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
				address: "", // GPS/Map address field will be updated later
				district,
				email,
				password,
			}),
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();

		if (res.ok) {
			setStatusMessage("Registration completed successfully!");
			setTimeout(() => {
				router.push("/login"); // Redirect to login after success
			}, 1500);
		} else {
			setError(data.error || "Registration failed.");
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

	return (
		<div className="max-w-md mx-auto mt-10 space-y-4">
			<h1 className="text-2xl font-bold">Register</h1>
			{error && <p className="text-red-500">{error}</p>}
			{statusMessage && (
				<p className="text-sm text-gray-600">{statusMessage}</p>
			)}

			{step === "phone" && (
				<div className="space-y-4">
					<input
						type="tel"
						placeholder="Phone Number"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>
					<button
						onClick={sendOTP}
						className="bg-blue-600 text-white px-4 py-2 rounded"
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
						className="w-full p-2 border rounded"
						required
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
				</div>
			)}

			{step === "form" && (
				<form
					onSubmit={handleCompleteRegistration}
					className="space-y-4"
				>
					<input
						type="text"
						placeholder="First Name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>
					<input
						type="text"
						placeholder="Last Name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>

					<select
						value={alYear}
						onChange={(e) => setAlYear(e.target.value)}
						className="w-full p-2 border rounded"
						required
					>
						<option value="">Select A/L Year</option>
						<option value="2025 AL">2025 AL</option>
						<option value="2026 AL">2026 AL</option>
						<option value="2027 AL">2027 AL</option>
					</select>

					<input
						type="text"
						placeholder="NIC Number"
						value={nic}
						onChange={handleNicChange}
						className="w-full p-2 border rounded"
						required
					/>

					<input
						type="text"
						placeholder="Gender"
						value={gender}
						readOnly
						className="w-full p-2 border rounded bg-gray-100"
					/>

					<input
						type="text"
						placeholder="Birthday"
						value={birthday}
						readOnly
						className="w-full p-2 border rounded bg-gray-100"
					/>

					<input
						type="tel"
						placeholder="WhatsApp Number"
						value={whatsapp}
						onChange={(e) => setWhatsapp(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>

					<AddressPicker
						onAddressSelect={(addr) => setAddress(addr)}
					/>
					{address && (
						<p className="text-sm text-gray-700">
							Selected Address: {address}
						</p>
					)}

					<select
						value={district}
						onChange={(e) => setDistrict(e.target.value)}
						className="w-full p-2 border rounded"
						required
					>
						<option value="">Select District</option>
						<option value="Colombo">Colombo</option>
						<option value="Gampaha">Gampaha</option>
						<option value="Kalutara">Kalutara</option>
						<option value="Kandy">Kandy</option>
						<option value="Matale">Matale</option>
						<option value="Nuwara Eliya">Nuwara Eliya</option>
						<option value="Galle">Galle</option>
						<option value="Matara">Matara</option>
						<option value="Hambantota">Hambantota</option>
						<option value="Kurunegala">Kurunegala</option>
						<option value="Puttalam">Puttalam</option>
						<option value="Anuradhapura">Anuradhapura</option>
						<option value="Polonnaruwa">Polonnaruwa</option>
						<option value="Ratnapura">Ratnapura</option>
						<option value="Kegalle">Kegalle</option>
						<option value="Badulla">Badulla</option>
						<option value="Monaragala">Monaragala</option>
						<option value="Trincomale">Trincomale</option>
						<option value="Batticaloa">Batticaloa</option>
						<option value="Ampara">Ampara</option>
						<option value="Jaffna">Jaffna</option>
						<option value="Kilinochchi">Kilinochchi</option>
						<option value="Vavuniya">Vavuniya</option>
						<option value="Mannar">Mannar</option>
						<option value="Mullaitivu">Mullaitivu</option>
					</select>

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-2 border rounded"
						required
					/>

					<button
						type="submit"
						className="bg-green-600 text-white px-4 py-2 rounded"
					>
						Complete Registration
					</button>
				</form>
			)}
		</div>
	);
}

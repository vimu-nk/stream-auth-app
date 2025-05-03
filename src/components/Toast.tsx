"use client";

import { useEffect, useState } from "react";

interface ToastProps {
	message: string;
	type?: "success" | "error";
	onClose: () => void;
}

export default function Toast({
	message,
	type = "success",
	onClose,
}: ToastProps) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const dismissTimer = setTimeout(() => setVisible(false), 2000);
		return () => clearTimeout(dismissTimer);
	}, []);

	useEffect(() => {
		if (!visible) {
			const cleanupTimer = setTimeout(() => onClose(), 300); // match transition duration
			return () => clearTimeout(cleanupTimer);
		}
	}, [visible, onClose]);

	return (
		<div
			className={`
				fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-lg text-sm text-white
				transform transition-all duration-300
				${visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
				${type === "success" ? "bg-[#2ECC71]" : "bg-[#DC3545]"}
			`}
		>
			{message}
		</div>
	);
}

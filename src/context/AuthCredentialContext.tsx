"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthCredentialContextType = {
	identifier: string;
	password: string;
	setCredentials: (identifier: string, password: string) => void;
};

const AuthCredentialContext = createContext<AuthCredentialContextType | null>(
	null
);

export const AuthCredentialProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const setCredentials = (id: string, pw: string) => {
		setIdentifier(id);
		setPassword(pw);
	};

	return (
		<AuthCredentialContext.Provider
			value={{ identifier, password, setCredentials }}
		>
			{children}
		</AuthCredentialContext.Provider>
	);
};

export const useAuthCredentials = () => {
	const ctx = useContext(AuthCredentialContext);
	if (!ctx) throw new Error("AuthCredentialProvider is missing");
	return ctx;
};

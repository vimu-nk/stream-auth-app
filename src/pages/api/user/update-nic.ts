import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const parseNic = (nic: string) => {
	const year = parseInt(nic.slice(0, 4), 10);
	const dayCode = parseInt(nic.slice(4, 7), 10);
	const gender = dayCode >= 500 ? "Female" : "Male";
	const day = gender === "Female" ? dayCode - 500 : dayCode;
	const date = new Date(year, 0);
	date.setDate(day);
	return { gender, birthday: date.toISOString().split("T")[0] };
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session?.user) return res.status(401).json({ error: "Unauthorized" });
	if (req.method !== "POST")
		return res.status(405).json({ error: "Method not allowed" });

	await connectDB();

	const { correctedNIC } = req.body;
	if (!correctedNIC || !/^\d{12}$/.test(correctedNIC)) {
		return res.status(400).json({ error: "Invalid NIC" });
	}

	const user = await User.findById(session.user.id);
	if (!user) return res.status(404).json({ error: "User not found" });

	const { gender, birthday } = parseNic(correctedNIC);
	user.nic = correctedNIC;
	user.gender = gender;
	user.birthday = new Date(birthday);
	user.verificationLevel = 1;

	await user.save();
	return res
		.status(200)
		.json({ message: "NIC updated. Please re-upload for verification." });
}

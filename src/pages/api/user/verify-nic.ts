import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import formidable from "formidable";
import vision from "@google-cloud/vision";
import { ensureTmpDir, TMP_DIR, deleteTmpFile } from "@/lib/tmpFileManager";

export const config = {
	api: {
		bodyParser: false,
	},
};

const client = new vision.ImageAnnotatorClient({
	keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const extractNic = (text: string) => {
	const match = text.match(/\b\d{12}\b/);
	return match ? match[0] : null;
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

	// Ensure tmp directory exists
	ensureTmpDir();

	const form = formidable({
		multiples: true,
		keepExtensions: true,
		uploadDir: TMP_DIR,
	});

	const { files } = await new Promise<{
		fields: formidable.Fields;
		files: formidable.Files;
	}>((resolve, reject) => {
		form.parse(req, (err, fields, files) =>
			err ? reject(err) : resolve({ fields, files })
		);
	});

	const front = Array.isArray(files.front) ? files.front[0] : files.front;
	const back = Array.isArray(files.back) ? files.back[0] : files.back;
	if (!front || !back)
		return res.status(400).json({ error: "Both images required" });

	try {
		const [frontResult] = await client.textDetection(front.filepath);
		const frontText = frontResult.fullTextAnnotation?.text || "";
		const extractedNIC = extractNic(frontText);
		if (!extractedNIC)
			return res.status(400).json({ error: "NIC number not detected" });

		const user = await User.findById(session.user.id);
		if (!user) return res.status(404).json({ error: "User not found" });

		if (user.nic !== extractedNIC) {
			return res.status(200).json({ nicMismatch: true, extractedNIC });
		}

		user.nicFrontImage = front.filepath;
		user.nicBackImage = back.filepath;
		user.verificationLevel = 2;
		await user.save();

		return res.status(200).json({ verified: true, level: 2 });
	} catch {
		return res.status(500).json({ error: "NIC verification failed" });
	} finally {
		// Clean up temporary files
		if (front && front.filepath) deleteTmpFile(front.filepath);
		if (back && back.filepath) deleteTmpFile(back.filepath);
	}
}

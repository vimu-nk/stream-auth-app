import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import path from "path";
import vision from "@google-cloud/vision";
import { writeFile, mkdir } from "fs/promises";

const client = new vision.ImageAnnotatorClient({
	keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const extractNic = (text: string) => {
	const match = text.match(/\b\d{12}\b/);
	return match ? match[0] : null;
};

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	// Debug session info
	console.log("Session received:", JSON.stringify(session, null, 2));

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await connectDB();

		// Log specific session user info
		console.log("User ID:", session.user.id);
		console.log("User email:", session.user.email);
		console.log("User name:", session.user.firstName);

		const formData = await req.formData();
		const front = formData.get("front") as File;
		const back = formData.get("back") as File;

		if (!front || !back) {
			return NextResponse.json(
				{ error: "Both images required" },
				{ status: 400 }
			);
		}

		// Create upload directory if it doesn't exist
		const uploadDir = path.join(process.cwd(), "tmp");
		await mkdir(uploadDir, { recursive: true });

		// Save front image with timestamp instead of UUID
		const timestamp = Date.now();
		const frontFilePath = path.join(
			uploadDir,
			`front_${timestamp}_${front.name}`
		);
		const frontBuffer = Buffer.from(await front.arrayBuffer());
		await writeFile(frontFilePath, frontBuffer);

		// Save back image with timestamp
		const backFilePath = path.join(
			uploadDir,
			`back_${timestamp}_${back.name}`
		);
		const backBuffer = Buffer.from(await back.arrayBuffer());
		await writeFile(backFilePath, backBuffer);

		// Use Google Vision API to extract text
		const [frontResult] = await client.textDetection(frontFilePath);
		const frontText = frontResult.fullTextAnnotation?.text || "";
		const extractedNIC = extractNic(frontText);

		if (!extractedNIC) {
			return NextResponse.json(
				{ error: "NIC number not detected" },
				{ status: 400 }
			);
		}

		// Instead of using findById directly, try to find by multiple identifiers
		let user = null;

		if (session.user.id) {
			user = await User.findById(session.user.id);
			console.log("Lookup by ID result:", user ? "Found" : "Not found");
		}

		// If not found by ID, try email
		if (!user && session.user.email) {
			user = await User.findOne({ email: session.user.email });
			console.log(
				"Lookup by email result:",
				user ? "Found" : "Not found"
			);
		}

		// If still not found, try uniqueId
		if (!user && session.user.uniqueId) {
			user = await User.findOne({ uniqueId: session.user.uniqueId });
			console.log(
				"Lookup by uniqueId result:",
				user ? "Found" : "Not found"
			);
		}

		if (!user) {
			return NextResponse.json(
				{
					error: "User not found",
					sessionInfo: {
						id: session.user.id,
						email: session.user.email,
						uniqueId: session.user.uniqueId,
					},
				},
				{ status: 404 }
			);
		}

		// Check if user has NIC property before comparison
		if (!user.nic) {
			return NextResponse.json(
				{ error: "No NIC number found in user record" },
				{ status: 400 }
			);
		}

		console.log(
			`Comparing extracted NIC: ${extractedNIC} with user NIC: ${user.nic}`
		);

		if (user.nic !== extractedNIC) {
			return NextResponse.json(
				{ nicMismatch: true, extractedNIC },
				{ status: 200 }
			);
		}

		user.nicFrontImage = frontFilePath;
		user.nicBackImage = backFilePath;
		user.verificationLevel = 2;
		await user.save();

		return NextResponse.json({ verified: true, level: 2 }, { status: 200 });
	} catch (error) {
		console.error("NIC verification error:", error);
		return NextResponse.json(
			{
				error: "NIC verification failed",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
};

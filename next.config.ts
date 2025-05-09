import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Function to clean temporary files
const cleanupTempFiles = () => {
	const tmpDir = path.join(process.cwd(), "tmp");
	if (fs.existsSync(tmpDir)) {
		fs.readdir(tmpDir, (err, files) => {
			if (err) console.error("Error reading tmp directory:", err);

			// Keep only files created in the last hour
			const oneHourAgo = Date.now() - 3600000;

			files.forEach((file) => {
				const filePath = path.join(tmpDir, file);
				fs.stat(filePath, (err, stats) => {
					if (err) return console.error(err);
					if (stats.isFile() && stats.mtimeMs < oneHourAgo) {
						fs.unlink(filePath, (err) => {
							if (err) console.error("Error deleting file:", err);
						});
					}
				});
			});
		});
	}
};

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	onDemandEntries: {
		// Add maxInactiveAge and pagesBufferLength
		maxInactiveAge: 60 * 1000,
		pagesBufferLength: 2,
	},
};

// Run cleanup on build
if (process.env.NODE_ENV === "production") {
	cleanupTempFiles();
}

export default nextConfig;

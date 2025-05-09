import fs from "fs";
import path from "path";

export const TMP_DIR = path.join(process.cwd(), "tmp");

// Ensure tmp directory exists
export function ensureTmpDir() {
	if (!fs.existsSync(TMP_DIR)) {
		fs.mkdirSync(TMP_DIR, { recursive: true });
	}
}

// Clean files older than specified hours
export function cleanupOldFiles(maxAgeHours = 24) {
	ensureTmpDir();

	const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
	const cutoffTime = Date.now() - maxAgeMs;

	try {
		const files = fs.readdirSync(TMP_DIR);

		for (const file of files) {
			const filePath = path.join(TMP_DIR, file);
			const stats = fs.statSync(filePath);

			if (stats.isFile() && stats.mtimeMs < cutoffTime) {
				fs.unlinkSync(filePath);
			}
		}
	} catch (err) {
		console.error("Error cleaning tmp directory:", err);
	}
}

// Delete specific file
export function deleteTmpFile(filePath: string) {
	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			return true;
		}
	} catch (err) {
		console.error("Error deleting file:", err);
	}
	return false;
}

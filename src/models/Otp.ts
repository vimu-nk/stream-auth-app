import mongoose, { Schema, model, models } from "mongoose";

const otpSchema = new Schema({
	phone: { type: String, required: true },
	code: { type: String, required: true },
	expiresAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now },
	attempts: { type: Number, default: 1 },
	lastSentAt: { type: Date, default: Date.now },
});

export const Otp = models.Otp || model("Otp", otpSchema);

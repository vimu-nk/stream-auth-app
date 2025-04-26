import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema({
	phone: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	isVerified: { type: Boolean, default: false },
});

export const User = models.User || model("User", userSchema);

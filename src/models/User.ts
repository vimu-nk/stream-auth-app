import mongoose, { Schema, model, models } from "mongoose";
const userSchema = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phone: { type: String, required: true, unique: true },
	isVerified: { type: Boolean, default: false },
});
export const User = models.User || model("User", userSchema);

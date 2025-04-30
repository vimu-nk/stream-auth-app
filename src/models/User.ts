import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema(
	{
		uniqueId: { type: Number, unique: true },
		phone: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		isVerified: { type: Boolean, default: false },
		verificationLevel: { type: Number, default: 0 }, // 0 = Unverified, 1 = Phone Verified, 2 = NIC Verified

		firstName: { type: String },
		lastName: { type: String },
		alYear: { type: String }, // 2025 AL, 2026 AL, etc.

		nic: { type: String }, // NIC entered by user
		gender: { type: String }, // Autofilled from NIC
		birthday: { type: Date }, // Autofilled from NIC

		whatsapp: { type: String },
		uAddress: { type: String },
		mapAddress: { type: String },
		district: { type: String },

		// NIC Extracted Original Fields
		orgNIC: { type: String },
		orgBday: { type: Date },
		orgGender: { type: String },
		fullName: { type: String },
		orgAddress: { type: String },

		nicFrontImage: { type: String }, // File URL or path
		nicBackImage: { type: String },
	},
	{ timestamps: true }
);

export const User = models.User || model("User", userSchema);

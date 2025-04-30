import mongoose, { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String, required: true },
		message: { type: String, required: true },
		read: { type: Boolean, default: false },
	},
	{
		timestamps: true, // adds createdAt and updatedAt
	}
);

export const Notification =
	models.Notification || model("Notification", notificationSchema);

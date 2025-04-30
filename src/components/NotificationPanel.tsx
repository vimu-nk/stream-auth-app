"use client";

import { useEffect, useState } from "react";

interface Notification {
	_id: string;
	title: string;
	message: string;
	read: boolean;
	createdAt: string;
}

export default function NotificationPanel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				setNotifications(data);
			} catch (err) {
				console.error("Failed to fetch notifications:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();
	}, []);

	return (
		<div className="mt-6 bg-white shadow rounded p-4">
			<h2 className="text-lg font-semibold mb-3 text-black">
				Notifications
			</h2>
			{loading ? (
				<p className="text-sm text-gray-500">Loading...</p>
			) : notifications.length === 0 ? (
				<p className="text-sm text-gray-500">No notifications yet.</p>
			) : (
				<ul className="space-y-3">
					{notifications.map((n) => (
						<li
							key={n._id}
							className={`p-3 rounded border ${
								n.read ? "bg-gray-100" : "bg-yellow-50"
							}`}
						>
							<p className="font-medium">{n.title}</p>
							<p className="text-sm text-gray-600">{n.message}</p>
							<p className="text-xs text-gray-400 mt-1">
								{new Date(n.createdAt).toLocaleString()}
							</p>
							{!n.read && (
								<button
									onClick={async () => {
										await fetch(
											"/api/notifications/mark-read",
											{
												method: "POST",
												headers: {
													"Content-Type":
														"application/json",
												},
												body: JSON.stringify({
													id: n._id,
												}),
											}
										);
										setNotifications((prev) =>
											prev.map((notif) =>
												notif._id === n._id
													? { ...notif, read: true }
													: notif
											)
										);
									}}
									className="mt-2 text-sm text-blue-600 underline"
								>
									Mark as read
								</button>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

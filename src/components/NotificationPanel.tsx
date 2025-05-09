"use client";

import { useState, useEffect } from "react";

interface Notification {
	_id: string;
	title: string;
	message: string;
	createdAt: string;
	read: boolean;
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
		<div className="bg-[#1A1A1A] rounded-2xl p-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-[#F0F0F0]">
					Notifications
				</h2>
				{notifications.length > 0 && (
					<span className="bg-[#1E90FF] text-[#F0F0F0] text-xs px-2 py-1 rounded-full">
						{notifications.filter((n) => !n.read).length} unread
					</span>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center py-8">
					<div className="text-[#AAABB8]">
						Loading notifications...
					</div>
				</div>
			) : notifications.length === 0 ? (
				<div className="bg-[#151515] rounded-xl p-6 text-center border border-[#2a2a2a]">
					<p className="text-[#AAABB8]">
						You have no notifications yet.
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{notifications.map((n) => (
						<li
							key={n._id}
							className={`p-4 rounded-xl border ${
								n.read
									? "bg-[#151515] border-[#2a2a2a]"
									: "bg-[#151515] border-[#1E90FF]"
							}`}
						>
							<div className="flex justify-between items-start">
								<p className="font-medium text-[#F0F0F0]">
									{n.title}
								</p>
								{!n.read && (
									<span className="bg-[#1E90FF] w-2 h-2 rounded-full"></span>
								)}
							</div>
							<p className="text-sm text-[#AAABB8] mt-1">
								{n.message}
							</p>
							<div className="flex justify-between items-center mt-3">
								<p className="text-xs text-[#AAABB8]">
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
														? {
																...notif,
																read: true,
														  }
														: notif
												)
											);
										}}
										className="text-xs text-[#7A5FFF] hover:underline"
									>
										Mark as read
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function sendOTP(
	mobile: string,
	message: string,
	transactionId: number
) {
	const now = Date.now();
	if (!cachedToken || now >= tokenExpiresAt) {
		const loginRes = await axios.post(
			"https://esms.dialog.lk/api/v2/user/login",
			{
				username: process.env.DIALOG_USERNAME,
				password: process.env.DIALOG_PASSWORD,
			}
		);
		cachedToken = loginRes.data.token;
		tokenExpiresAt = now + loginRes.data.expiration * 1000;
	}

	const payload = {
		msisdn: [{ mobile }],
		message,
		sourceAddress: process.env.DIALOG_MASK,
		transaction_id: transactionId,
		payment_method: 0,
	};

	return await axios.post("https://e-sms.dialog.lk/api/v2/sms", payload, {
		headers: {
			Authorization: `Bearer ${cachedToken}`,
			"Content-Type": "application/json",
		},
	});
}

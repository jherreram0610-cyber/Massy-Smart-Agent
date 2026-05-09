import axios from "axios";

const ML_API_BASE = "https://api.mercadolibre.com";

let mlAccessToken: string | null = null;
let mlTokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (mlAccessToken && Date.now() < mlTokenExpiry) return mlAccessToken;

  const res = await axios.post(`${ML_API_BASE}/oauth/token`, {
    grant_type: "refresh_token",
    client_id: process.env.ML_APP_ID,
    client_secret: process.env.ML_APP_SECRET,
    refresh_token: process.env.ML_REFRESH_TOKEN,
  });

  mlAccessToken = res.data.access_token;
  // Expire 5 minutes before actual expiry to be safe
  mlTokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
  return mlAccessToken!;
}

export async function sendMercadoLibreMessage(packId: string, text: string): Promise<void> {
  const token = await getAccessToken();
  await axios.post(
    `${ML_API_BASE}/messages/packs/${packId}/sellers/${process.env.ML_SELLER_ID}`,
    { text },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-format-new": "true",
      },
    }
  );
}

export async function getMercadoLibreMessage(resourceUrl: string): Promise<{ packId: string; buyerName: string; text: string } | null> {
  const token = await getAccessToken();

  try {
    const msgRes = await axios.get(`${ML_API_BASE}${resourceUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const msg = msgRes.data;
    const lastMessage = msg.messages?.[msg.messages.length - 1];

    if (!lastMessage || lastMessage.from?.user_id === Number(process.env.ML_SELLER_ID)) {
      return null; // Skip our own messages
    }

    return {
      packId: String(msg.pack_id ?? msg.id),
      buyerName: lastMessage.from?.name ?? "Cliente ML",
      text: lastMessage.text?.plain ?? "",
    };
  } catch {
    return null;
  }
}

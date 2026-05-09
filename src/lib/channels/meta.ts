import axios from "axios";

const WA_API_BASE = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  await axios.post(
    `${WA_API_BASE}/${process.env.META_WA_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function sendFacebookMessage(recipientId: string, text: string): Promise<void> {
  await axios.post(
    `${WA_API_BASE}/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text },
    },
    {
      params: { access_token: process.env.META_FB_TOKEN },
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function sendInstagramMessage(recipientId: string, text: string): Promise<void> {
  await axios.post(
    `${WA_API_BASE}/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text },
    },
    {
      params: { access_token: process.env.META_IG_TOKEN },
      headers: { "Content-Type": "application/json" },
    }
  );
}

export interface MetaWebhookEntry {
  id: string;
  changes?: MetaChange[];
  messaging?: MetaMessagingEvent[];
}

export interface MetaChange {
  value: {
    messaging_product?: string;
    metadata?: { phone_number_id: string; display_phone_number: string };
    contacts?: Array<{ profile: { name: string }; wa_id: string }>;
    messages?: Array<{
      from: string;
      id: string;
      timestamp: string;
      type: string;
      text?: { body: string };
    }>;
  };
  field: string;
}

export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text: string };
}

export function extractWhatsAppMessage(entry: MetaWebhookEntry): { from: string; text: string; name: string } | null {
  const change = entry.changes?.find((c) => c.field === "messages");
  const msg = change?.value.messages?.[0];
  if (!msg || msg.type !== "text" || !msg.text?.body) return null;
  const contact = change?.value.contacts?.[0];
  return {
    from: msg.from,
    text: msg.text.body,
    name: contact?.profile.name ?? "",
  };
}

export function extractFbOrIgMessage(messaging: MetaMessagingEvent): { senderId: string; text: string } | null {
  if (!messaging.message?.text) return null;
  return { senderId: messaging.sender.id, text: messaging.message.text };
}

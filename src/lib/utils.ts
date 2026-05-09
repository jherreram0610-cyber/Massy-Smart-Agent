import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, h:mm a", { locale: es });
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatSlotTime(startsAt: Date | string, endsAt: Date | string): string {
  const start = format(new Date(startsAt), "EEEE d 'de' MMMM, h:mm a", { locale: es });
  const end = format(new Date(endsAt), "h:mm a", { locale: es });
  return `${start} – ${end}`;
}

export function getChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    web: "Sitio Web",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    instagram: "Instagram",
    mercadolibre: "MercadoLibre",
  };
  return labels[channel] ?? channel;
}

export function getChannelEmoji(channel: string): string {
  const emojis: Record<string, string> = {
    web: "🌐",
    whatsapp: "📱",
    facebook: "📘",
    instagram: "📸",
    mercadolibre: "🛒",
  };
  return emojis[channel] ?? "💬";
}

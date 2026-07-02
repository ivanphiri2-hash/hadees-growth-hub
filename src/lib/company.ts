export const WHATSAPP_NUMBER = "083 753 5798";
export const WHATSAPP_LINK = "https://wa.me/27837535798";
export const COMPANY_NAME = "HADEES TRADING PTY LTD";
export const COMPANY_SHORT = "Hadees Trading";

export function waLink(message?: string) {
  if (!message) return WHATSAPP_LINK;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}

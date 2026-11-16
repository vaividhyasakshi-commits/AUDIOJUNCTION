export const COMMUNITY_LINK = "";

// Paste your actual WhatsApp community invite link above.

export function getCommunityInvitation(enquiry) {
  if (!COMMUNITY_LINK.startsWith("https://chat.whatsapp.com/")) {
    return null;
  }

  const phone = String(enquiry.phone || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(phone)) {
    return null;
  }

  const message = `Hello ${enquiry.name},

Thank you for sharing your requirements with Audio Junction.

We would love to invite you to our official WhatsApp Community, where you can stay updated with our latest products, vintage collections and new arrivals.

Join our community here:
${COMMUNITY_LINK}

Thank you,
Team Audio Junction`;

  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}
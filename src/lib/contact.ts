export const buildWhatsAppLink = (text: string) => {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '237048083756';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export const buildMailtoLink = (subject: string, body: string) => {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'aniekaneazy@gmail.com';
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

import { MessageCircle } from "lucide-react";
import { getSettings, whatsappLink } from "@/lib/settings";

export async function WhatsAppFab() {
  const s = await getSettings();
  return (
    <a
      href={whatsappLink(s["contact.whatsapp"], "مرحبًا، أريد الاستفسار عن الكورسات")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition hover:scale-110 hover:bg-emerald-600"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

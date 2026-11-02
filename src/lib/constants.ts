export const SITE_NAME = "نيفو للتدريب";
export const SITE_NAME_EN = "NIVO for Training";
export const SESSION_COOKIE = "nivo_session";
export const SESSION_DAYS = 30;

export const ROLES = { STUDENT: "STUDENT", ADMIN: "ADMIN" } as const;

export const LEVELS: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
};

export const MODES: Record<string, string> = {
  RECORDED: "مسجل",
  LIVE: "لايف مباشر",
  HYBRID: "مسجل + لايف",
};

export const TOPUP_METHODS: Record<string, string> = {
  VODAFONE_CASH: "فودافون كاش",
  INSTAPAY: "إنستا باي",
  BANK: "تحويل بنكي",
  OTHER: "طريقة أخرى",
};

export const TOPUP_STATUS: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "تم القبول",
  REJECTED: "مرفوض",
};

export const TX_TYPES: Record<string, string> = {
  TOPUP: "شحن رصيد",
  PURCHASE: "شراء كورس",
  REFUND: "استرداد",
  ADJUSTMENT: "تعديل إداري",
};

export const PLATFORMS: Record<string, string> = {
  ZOOM: "Zoom",
  MEET: "Google Meet",
  JITSI: "Jitsi / سيرفر الأكاديمية",
  OTHER: "منصة أخرى",
};

export const MIN_TOPUP = 20;
export const MAX_TOPUP = 100000;
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/** Default editable settings (stored in the Setting table). */
export const DEFAULT_SETTINGS: Record<string, string> = {
  "contact.whatsapp": "201000000000",
  "contact.email": "info@nivo.academy",
  "contact.phone": "+20 100 000 0000",
  "pay.vodafone": "01000000000",
  "pay.instapay": "nivo@instapay",
  "pay.bank": "اسم البنك – رقم الحساب / IBAN",
  "pay.notes":
    "حوّل المبلغ المطلوب ثم ارفع صورة إيصال التحويل بوضوح. تتم مراجعة الطلب وإضافة الرصيد خلال ساعات.",
  "social.facebook": "",
  "social.instagram": "",
  "social.youtube": "",
  "social.tiktok": "",
};

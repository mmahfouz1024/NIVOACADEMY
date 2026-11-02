/* Seed: categories, sample courses (edit/delete from the admin panel), admin + demo users. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const CATEGORIES = [
  { slug: "languages", name: "اللغات", icon: "Languages" },
  { slug: "ai", name: "الذكاء الاصطناعي", icon: "BrainCircuit" },
  { slug: "programming", name: "البرمجة وتطوير الويب", icon: "Code2" },
  { slug: "marketing", name: "التسويق الرقمي", icon: "Megaphone" },
  { slug: "design", name: "التصميم والجرافيك", icon: "Palette" },
  { slug: "business", name: "الأعمال وريادة الأعمال", icon: "Briefcase" },
  { slug: "media", name: "التصوير والمونتاج", icon: "Camera" },
  { slug: "office", name: "الأوفيس والمحاسبة", icon: "BarChart3" },
  { slug: "soft-skills", name: "تطوير الذات والمهارات", icon: "Rocket" },
];

type SeedCourse = {
  slug: string; title: string; subtitle: string; category: string; level: string; mode: string;
  price: number; oldPrice?: number; hours: number; featured?: boolean; description: string;
  outcomes: string[]; sections: { name: string; lessons: [string, number, boolean?][] }[];
};

const COURSES: SeedCourse[] = [
  {
    slug: "english-from-zero", title: "اللغة الإنجليزية من الصفر للاحتراف", subtitle: "ابدأ من الحروف وحتى المحادثة بثقة في 8 أسابيع",
    category: "languages", level: "BEGINNER", mode: "HYBRID", price: 450, oldPrice: 700, hours: 24, featured: true,
    description: "كورس شامل يأخذك خطوة بخطوة في القواعد والمفردات والنطق والمحادثة، مع تطبيقات عملية وحصص لايف أسبوعية لتصحيح النطق والتدرّب على الحوار.",
    outcomes: ["التحدث بجمل صحيحة في المواقف اليومية", "فهم القواعد الأساسية بسهولة", "بناء حصيلة مفردات تتجاوز 1000 كلمة", "الاستماع والفهم بثقة"],
    sections: [
      { name: "الأساسيات", lessons: [["الحروف والنطق الصحيح", 18, true], ["التعارف والتحيات", 20], ["الأرقام والتواريخ", 16]] },
      { name: "القواعد والمحادثة", lessons: [["أزمنة الفعل البسيطة", 25], ["تكوين الأسئلة", 22], ["حوارات الحياة اليومية", 30]] },
    ],
  },
  {
    slug: "german-a1", title: "اللغة الألمانية – المستوى A1", subtitle: "الأساس القوي لتتعلم الألمانية للدراسة والعمل",
    category: "languages", level: "BEGINNER", mode: "LIVE", price: 800, hours: 40,
    description: "كورس لايف تفاعلي لتأسيس اللغة الألمانية حتى مستوى A1 مع التركيز على النطق والمحادثة والتحضير للامتحان.",
    outcomes: ["إتقان الأبجدية والنطق الألماني", "تكوين جمل بسيطة والتعريف بنفسك", "الاستعداد لامتحان A1"],
    sections: [{ name: "البداية", lessons: [["الحروف والنطق", 25, true], ["التحيات والتعارف", 30], ["الأرقام والوقت", 28]] }],
  },
  {
    slug: "ai-for-everyone", title: "الذكاء الاصطناعي للجميع: من الفكرة للتطبيق", subtitle: "استخدم ChatGPT وGemini وأدوات الـ AI لمضاعفة إنتاجيتك",
    category: "ai", level: "BEGINNER", mode: "RECORDED", price: 600, oldPrice: 900, hours: 12, featured: true,
    description: "تعرّف على عالم الذكاء الاصطناعي التوليدي وتعلّم كتابة الأوامر (Prompts) باحتراف وأتمتة مهامك اليومية في العمل والدراسة والتسويق.",
    outcomes: ["فهم كيف تعمل نماذج الذكاء الاصطناعي", "كتابة Prompts احترافية", "أتمتة المهام وكتابة المحتوى", "اختيار الأداة المناسبة لكل مهمة"],
    sections: [
      { name: "المفاهيم", lessons: [["ما هو الذكاء الاصطناعي؟", 15, true], ["أشهر الأدوات وكيف تختار", 20]] },
      { name: "التطبيق", lessons: [["هندسة الأوامر Prompt Engineering", 35], ["الكتابة وإنشاء المحتوى", 30], ["أتمتة المهام اليومية", 28]] },
    ],
  },
  {
    slug: "ai-agents-automation", title: "بناء وكلاء الذكاء الاصطناعي وأتمتة الأعمال", subtitle: "اصنع Agents تعمل نيابة عنك باستخدام n8n وAPIs",
    category: "ai", level: "INTERMEDIATE", mode: "HYBRID", price: 1200, hours: 20, featured: true,
    description: "كورس عملي لبناء أنظمة أتمتة ووكلاء ذكيين تربط بين الأدوات والخدمات، مع مشاريع حقيقية.",
    outcomes: ["بناء Workflow أتمتة كامل", "ربط نماذج الذكاء الاصطناعي بالتطبيقات", "تصميم Agent لخدمة العملاء"],
    sections: [{ name: "الأساسيات", lessons: [["مدخل للأتمتة", 20, true], ["التعامل مع الـ APIs", 35], ["مشروع: بوت خدمة عملاء", 50]] }],
  },
  {
    slug: "web-development-bootcamp", title: "احتراف تطوير الويب: HTML وCSS وJavaScript", subtitle: "ابنِ مواقع حديثة متجاوبة من الصفر",
    category: "programming", level: "BEGINNER", mode: "RECORDED", price: 750, oldPrice: 1100, hours: 36, featured: true,
    description: "رحلة كاملة من أساسيات الويب حتى بناء مشاريع حقيقية تضيفها لسيرتك الذاتية.",
    outcomes: ["بناء صفحات متجاوبة", "برمجة التفاعل بـ JavaScript", "العمل مع Git والنشر على الإنترنت"],
    sections: [
      { name: "HTML & CSS", lessons: [["هيكل الصفحة بـ HTML", 30, true], ["التنسيق بـ CSS", 40], ["التصميم المتجاوب", 35]] },
      { name: "JavaScript", lessons: [["أساسيات JavaScript", 45], ["التعامل مع DOM", 40]] },
    ],
  },
  {
    slug: "python-programming", title: "البرمجة بلغة Python للمبتدئين", subtitle: "اللغة الأسهل والأكثر طلبًا في سوق العمل",
    category: "programming", level: "BEGINNER", mode: "RECORDED", price: 500, hours: 18,
    description: "تعلّم البرمجة من الصفر باستخدام Python مع تمارين وتطبيقات عملية.",
    outcomes: ["فهم أساسيات البرمجة", "كتابة برامج وسكربتات مفيدة", "التعامل مع الملفات والبيانات"],
    sections: [{ name: "البداية", lessons: [["تثبيت Python وأول برنامج", 15, true], ["المتغيرات والشروط", 25], ["الحلقات والدوال", 30]] }],
  },
  {
    slug: "digital-marketing-pro", title: "التسويق الرقمي الاحترافي", subtitle: "من الخطة التسويقية حتى الحملات المدفوعة",
    category: "marketing", level: "INTERMEDIATE", mode: "HYBRID", price: 900, oldPrice: 1300, hours: 28, featured: true,
    description: "تعلّم بناء استراتيجية تسويق رقمي متكاملة: السوشيال ميديا، الإعلانات المدفوعة، المحتوى، والتحليلات.",
    outcomes: ["بناء خطة تسويقية كاملة", "إدارة حملات فيسبوك وإنستجرام", "قياس النتائج وتحسين الأداء"],
    sections: [{ name: "الأساسيات", lessons: [["مفاهيم التسويق الرقمي", 25, true], ["تحليل الجمهور المستهدف", 30], ["الإعلانات المدفوعة", 45]] }],
  },
  {
    slug: "social-media-management", title: "إدارة السوشيال ميديا وصناعة المحتوى", subtitle: "حوّل صفحتك إلى علامة تجارية مؤثرة",
    category: "marketing", level: "BEGINNER", mode: "RECORDED", price: 400, hours: 14,
    description: "تعلّم تخطيط المحتوى وكتابة الكوبي رايتنج وإدارة المجتمع على المنصات المختلفة.",
    outcomes: ["إعداد خطة محتوى شهرية", "كتابة بوستات جذابة", "إدارة التفاعل والمجتمع"],
    sections: [{ name: "المحتوى", lessons: [["تخطيط المحتوى", 22, true], ["الكوبي رايتنج", 28], ["قياس الأداء", 20]] }],
  },
  {
    slug: "graphic-design-photoshop", title: "التصميم الجرافيكي باحتراف", subtitle: "Photoshop وIllustrator وCanva من الصفر",
    category: "design", level: "BEGINNER", mode: "RECORDED", price: 650, hours: 22,
    description: "كورس عملي لتعلم أساسيات التصميم وصناعة الهويات والإعلانات.",
    outcomes: ["إتقان أدوات التصميم", "تصميم لوجو وهوية بصرية", "تجهيز تصميمات للسوشيال ميديا"],
    sections: [{ name: "الأساسيات", lessons: [["نظرية الألوان والخطوط", 25, true], ["أدوات Photoshop", 40], ["تصميم هوية بصرية", 45]] }],
  },
  {
    slug: "business-startup", title: "ريادة الأعمال وبدء مشروعك الخاص", subtitle: "من الفكرة إلى أول عميل",
    category: "business", level: "INTERMEDIATE", mode: "LIVE", price: 1000, hours: 16,
    description: "ورشة لايف تأخذك في رحلة تأسيس مشروعك: دراسة السوق، نموذج العمل، التسعير، والمبيعات.",
    outcomes: ["اختبار فكرة المشروع", "بناء نموذج عمل Business Model", "وضع خطة مالية مبسطة"],
    sections: [{ name: "التأسيس", lessons: [["من أين تبدأ؟", 30, true], ["دراسة السوق والمنافسين", 40]] }],
  },
  {
    slug: "video-editing-premiere", title: "المونتاج وصناعة الفيديو", subtitle: "Premiere Pro وCapCut لصناعة محتوى احترافي",
    category: "media", level: "BEGINNER", mode: "RECORDED", price: 550, hours: 15,
    description: "تعلّم قصّ وتركيب الفيديو، الصوت، والمؤثرات، وتجهيزه للنشر على المنصات.",
    outcomes: ["مونتاج فيديو كامل", "تحسين الصوت والألوان", "تصدير الفيديو للمنصات"],
    sections: [{ name: "المونتاج", lessons: [["واجهة البرنامج والتعامل مع الملفات", 22, true], ["القص والتركيب", 35], ["الصوت والألوان", 30]] }],
  },
  {
    slug: "excel-professional", title: "إكسيل من الأساسيات للاحتراف", subtitle: "المعادلات والجداول المحورية ولوحات البيانات",
    category: "office", level: "BEGINNER", mode: "RECORDED", price: 350, hours: 12,
    description: "كورس عملي في Excel لمن يريد تسريع العمل وتحليل البيانات باحتراف.",
    outcomes: ["كتابة المعادلات الأساسية والمتقدمة", "استخدام الجداول المحورية", "بناء لوحات بيانات تفاعلية"],
    sections: [{ name: "الأساسيات", lessons: [["واجهة Excel والخلايا", 18, true], ["المعادلات والدوال", 32], ["Pivot Tables", 35]] }],
  },
  {
    slug: "communication-skills", title: "مهارات التواصل والتقديم والإقناع", subtitle: "تحدث بثقة وأقنع من حولك",
    category: "soft-skills", level: "BEGINNER", mode: "LIVE", price: 300, hours: 8,
    description: "ورشة عملية لتطوير مهارات التواصل وعرض الأفكار وإدارة الحوار.",
    outcomes: ["التخلص من رهبة الحديث", "بناء عرض تقديمي مقنع", "قراءة لغة الجسد"],
    sections: [{ name: "الورشة", lessons: [["أسس التواصل الفعال", 25, true], ["فن العرض والتقديم", 35]] }],
  },
];

async function main() {
  const samples = process.env.NODE_ENV !== "production" || process.env.SEED_SAMPLES === "1";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@nivo.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "مدير النظام", email: adminEmail, phone: "01000000000", role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 11) },
  });

  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, order: i } });
    catIds[c.slug] = row.id;
  }

  if (samples && (await db.course.count()) === 0) {
    for (const c of COURSES) {
      const course = await db.course.create({
        data: {
          slug: c.slug, title: c.title, subtitle: c.subtitle, description: c.description,
          outcomes: c.outcomes.join("\n"), categoryId: catIds[c.category], level: c.level, mode: c.mode,
          price: c.price, oldPrice: c.oldPrice ?? null, durationHours: c.hours, featured: !!c.featured,
          published: true, instructorName: "فريق نيفو للتدريب",
          instructorBio: "نخبة من المدربين المتخصصين في نيفو للتدريب.",
        },
      });
      let order = 1;
      for (const s of c.sections) {
        for (const [title, mins, free] of s.lessons) {
          await db.lesson.create({
            data: { courseId: course.id, section: s.name, title, durationMin: mins, isFree: !!free, order: order++ },
          });
        }
      }
    }
  }

  if (samples && (await db.liveSession.count()) === 0) {
    const german = await db.course.findUnique({ where: { slug: "german-a1" } });
    const biz = await db.course.findUnique({ where: { slug: "business-startup" } });
    const day = 24 * 60 * 60 * 1000;
    await db.liveSession.createMany({
      data: [
        { title: "المحاضرة الأولى – الحروف والنطق", courseId: german?.id, startsAt: new Date(Date.now() + 2 * day), durationMin: 90, platform: "ZOOM", joinUrl: "https://zoom.us/" },
        { title: "ورشة: اختبار فكرة مشروعك", courseId: biz?.id, startsAt: new Date(Date.now() + 4 * day), durationMin: 120, platform: "MEET", joinUrl: "https://meet.google.com/" },
      ],
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const demo = await db.user.upsert({
      where: { email: "demo@nivo.local" },
      update: {},
      create: { name: "طالب تجريبي", email: "demo@nivo.local", phone: "01012345678", balance: 1000, passwordHash: await bcrypt.hash("Demo12345!", 11) },
    });
    if ((await db.walletTransaction.count({ where: { userId: demo.id } })) === 0) {
      await db.walletTransaction.create({
        data: { userId: demo.id, type: "ADJUSTMENT", amount: 1000, balanceAfter: 1000, note: "رصيد تجريبي" },
      });
    }
  }

  console.log(`Seed done. Admin: ${adminEmail}`);
}

main().finally(() => db.$disconnect());

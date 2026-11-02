"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, fromLocalInput } from "@/lib/utils";
import {
  approveTopup,
  rejectTopup,
  adjustBalance,
  refundEnrollment,
  WalletError,
} from "@/lib/wallet";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { FormState } from "@/lib/form-state";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const v = Number(String(fd.get(k) ?? "").trim());
  return Number.isFinite(v) ? Math.round(v) : 0;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/courses");
  if (slug) revalidatePath(`/courses/${slug}`);
  revalidatePath("/admin/courses");
}

/* ───────────── Courses ───────────── */

export async function saveCourseAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");

  const parsed = z
    .object({
      title: z.string().min(3, "اكتب عنوان الكورس"),
      categoryId: z.string().min(1, "اختر التصنيف"),
      level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      mode: z.enum(["RECORDED", "LIVE", "HYBRID"]),
      price: z.number().int().min(0, "السعر غير صحيح"),
    })
    .safeParse({
      title: str(fd, "title"),
      categoryId: str(fd, "categoryId"),
      level: str(fd, "level"),
      mode: str(fd, "mode"),
      price: num(fd, "price"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const oldPriceRaw = num(fd, "oldPrice");
  const thumb = str(fd, "thumbnail");
  if (thumb && !/^https?:\/\//i.test(thumb) && !thumb.startsWith("/")) {
    return { error: "رابط الصورة يجب أن يبدأ بـ https://" };
  }

  const data = {
    ...parsed.data,
    subtitle: str(fd, "subtitle"),
    description: str(fd, "description"),
    outcomes: str(fd, "outcomes"),
    oldPrice: oldPriceRaw > 0 ? oldPriceRaw : null,
    thumbnail: thumb || null,
    instructorName: str(fd, "instructorName"),
    instructorBio: str(fd, "instructorBio"),
    durationHours: num(fd, "durationHours"),
    published: bool(fd, "published"),
    featured: bool(fd, "featured"),
  };

  let slug = slugify(str(fd, "slug") || data.title);
  const clash = await db.course.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

  let courseId = id;
  if (id) {
    await db.course.update({ where: { id }, data: { ...data, slug } });
  } else {
    const c = await db.course.create({ data: { ...data, slug } });
    courseId = c.id;
  }
  revalidateCatalog(slug);
  if (!id) redirect(`/admin/courses/${courseId}`);
  return { ok: true, message: "تم حفظ الكورس" };
}

export async function deleteCourseAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const enrolled = await db.enrollment.count({ where: { courseId: id } });
  if (enrolled > 0) {
    await db.course.update({ where: { id }, data: { published: false } });
  } else {
    await db.course.delete({ where: { id } });
  }
  revalidateCatalog();
  redirect("/admin/courses");
}

/* ───────────── Lessons ───────────── */

export async function saveLessonAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const courseId = str(fd, "courseId");
  const title = str(fd, "title");
  if (title.length < 2) return { error: "اكتب عنوان الدرس" };
  const videoUrl = str(fd, "videoUrl");
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) return { error: "رابط الفيديو يجب أن يبدأ بـ https://" };

  const data = {
    title,
    section: str(fd, "section"),
    description: str(fd, "description"),
    videoUrl,
    durationMin: num(fd, "durationMin"),
    order: num(fd, "order"),
    isFree: bool(fd, "isFree"),
  };
  if (id) {
    await db.lesson.update({ where: { id }, data });
  } else {
    const last = await db.lesson.findFirst({ where: { courseId }, orderBy: { order: "desc" } });
    await db.lesson.create({
      data: { ...data, courseId, order: data.order || (last?.order ?? 0) + 1 },
    });
  }
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/learn/[slug]", "page");
  return { ok: true, message: "تم حفظ الدرس" };
}

export async function deleteLessonAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const lesson = await db.lesson.delete({ where: { id } });
  revalidatePath(`/admin/courses/${lesson.courseId}`);
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/learn/[slug]", "page");
}

/* ───────────── Categories ───────────── */

export async function saveCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (name.length < 2) return { error: "اكتب اسم التصنيف" };
  const data = { name, icon: str(fd, "icon") || "BookOpen", order: num(fd, "order") };
  if (id) {
    await db.category.update({ where: { id }, data });
  } else {
    let slug = slugify(str(fd, "slug") || name);
    if (await db.category.findUnique({ where: { slug } })) slug += `-${Math.random().toString(36).slice(2, 5)}`;
    await db.category.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/categories");
  revalidateCatalog();
  return { ok: true, message: "تم الحفظ" };
}

export async function deleteCategoryAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const used = await db.course.count({ where: { categoryId: id } });
  if (used === 0) await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidateCatalog();
}

/* ───────────── Wallet / top-ups ───────────── */

export async function approveTopupAction(fd: FormData) {
  const admin = await requireAdmin();
  try {
    await approveTopup(str(fd, "id"), admin.id, str(fd, "note"));
  } catch (e) {
    if (!(e instanceof WalletError)) throw e;
  }
  revalidatePath("/admin/topups");
  revalidatePath("/admin");
}

export async function rejectTopupAction(fd: FormData) {
  const admin = await requireAdmin();
  try {
    await rejectTopup(str(fd, "id"), admin.id, str(fd, "note") || "تم رفض الطلب");
  } catch (e) {
    if (!(e instanceof WalletError)) throw e;
  }
  revalidatePath("/admin/topups");
  revalidatePath("/admin");
}

export async function adjustBalanceAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const userId = str(fd, "userId");
  const sign = str(fd, "sign") === "debit" ? -1 : 1;
  const amount = num(fd, "amount") * sign;
  try {
    await adjustBalance(userId, amount, str(fd, "note"), admin.id);
  } catch (e) {
    if (e instanceof WalletError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: "تم تعديل الرصيد" };
}

export async function refundEnrollmentAction(fd: FormData) {
  const admin = await requireAdmin();
  try {
    await refundEnrollment(str(fd, "id"), admin.id);
  } catch (e) {
    if (!(e instanceof WalletError)) throw e;
  }
  revalidatePath(`/admin/users/${str(fd, "userId")}`);
}

/* ───────────── Users ───────────── */

export async function toggleUserActiveAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  if (id === admin.id) return;
  const u = await db.user.findUniqueOrThrow({ where: { id } });
  await db.user.update({ where: { id }, data: { active: !u.active } });
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
}

export async function setRoleAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  if (id === admin.id) return;
  const role = str(fd, "role") === "ADMIN" ? "ADMIN" : "STUDENT";
  await db.user.update({ where: { id }, data: { role } });
  await db.auditLog.create({ data: { actorId: admin.id, action: "SET_ROLE", detail: `${id} → ${role}` } });
  revalidatePath(`/admin/users/${id}`);
}

/* ───────────── Live sessions ───────────── */

export async function saveLiveAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const startsAtRaw = str(fd, "startsAt");
  if (title.length < 3) return { error: "اكتب عنوان الجلسة" };
  if (!startsAtRaw) return { error: "حدد موعد الجلسة" };
  const joinUrl = str(fd, "joinUrl");
  if (joinUrl && !/^https?:\/\//i.test(joinUrl)) return { error: "رابط الدخول يجب أن يبدأ بـ https://" };

  const data = {
    title,
    description: str(fd, "description"),
    startsAt: fromLocalInput(startsAtRaw),
    durationMin: num(fd, "durationMin") || 60,
    platform: ["ZOOM", "MEET", "JITSI", "OTHER"].includes(str(fd, "platform")) ? str(fd, "platform") : "ZOOM",
    joinUrl,
    courseId: str(fd, "courseId") || null,
    published: bool(fd, "published"),
  };
  if (id) await db.liveSession.update({ where: { id }, data });
  else await db.liveSession.create({ data });
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم حفظ الجلسة" };
}

export async function deleteLiveAction(fd: FormData) {
  await requireAdmin();
  await db.liveSession.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/live");
  revalidatePath("/live");
}

/* ───────────── Settings ───────────── */

export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!fd.has(key)) continue;
    const value = str(fd, key).slice(0, 500);
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "تم حفظ الإعدادات" };
}

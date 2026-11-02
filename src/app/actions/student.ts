"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { saveReceipt } from "@/lib/storage";
import { purchaseCourse, WalletError, newCertificateCode } from "@/lib/wallet";
import { MAX_TOPUP, MIN_TOPUP, TOPUP_METHODS } from "@/lib/constants";
import type { FormState } from "@/lib/form-state";

export async function requestTopupAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/wallet");

  const rl = rateLimit(`topup:${user.id}`, 6, 60 * 60 * 1000);
  if (!rl.ok) return { error: "طلبات كثيرة خلال وقت قصير. حاول لاحقًا" };

  const schema = z.object({
    amount: z.coerce
      .number()
      .int("المبلغ يجب أن يكون رقمًا صحيحًا")
      .min(MIN_TOPUP, `أقل مبلغ للشحن ${MIN_TOPUP} ج.م`)
      .max(MAX_TOPUP, "المبلغ كبير جدًا"),
    method: z.string().refine((m) => m in TOPUP_METHODS, "اختر طريقة التحويل"),
    senderRef: z.string().trim().max(120).default(""),
  });
  const parsed = schema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    senderRef: formData.get("senderRef") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const pending = await db.topupRequest.count({ where: { userId: user.id, status: "PENDING" } });
  if (pending >= 5) return { error: "لديك 5 طلبات قيد المراجعة. انتظر مراجعتها أولًا" };

  const file = formData.get("receipt");
  if (!(file instanceof File)) return { error: "ارفع صورة إيصال التحويل" };

  let saved;
  try {
    saved = await saveReceipt(file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذر رفع الملف" };
  }

  const dup = await db.topupRequest.findFirst({
    where: { receiptHash: saved.hash, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (dup) return { error: "تم رفع هذا الإيصال من قبل. لا يمكن استخدام نفس الإيصال مرتين" };

  await db.topupRequest.create({
    data: {
      userId: user.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      senderRef: parsed.data.senderRef,
      receiptPath: saved.path,
      receiptHash: saved.hash,
    },
  });
  revalidatePath("/wallet");
  revalidatePath("/admin/topups");
  return { ok: true, message: "تم إرسال طلب الشحن. سيتم مراجعته وإضافة الرصيد قريبًا." };
}

export async function purchaseAction(_: FormState, formData: FormData): Promise<FormState> {
  const courseId = String(formData.get("courseId") ?? "");
  const user = await requireUser();
  let slug = "";
  try {
    const course = await purchaseCourse(user.id, courseId);
    slug = course.slug;
  } catch (e) {
    if (e instanceof WalletError) return { error: e.message };
    return { error: "حدث خطأ غير متوقع" };
  }
  revalidatePath("/wallet");
  revalidatePath("/my-courses");
  redirect(`/learn/${encodeURIComponent(slug)}`);
}

export async function toggleLessonAction(lessonId: string) {
  const user = await requireUser();
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true },
  });
  if (!lesson) return;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
  });
  if (!enrollment) return;

  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  if (existing) {
    await db.lessonProgress.delete({ where: { id: existing.id } });
  } else {
    await db.lessonProgress.create({ data: { userId: user.id, lessonId } });
  }

  // Issue certificate once every lesson is completed.
  const [total, done] = await Promise.all([
    db.lesson.count({ where: { courseId: lesson.courseId } }),
    db.lessonProgress.count({ where: { userId: user.id, lesson: { courseId: lesson.courseId } } }),
  ]);
  if (total > 0 && done >= total && !enrollment.certificateCode) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { completedAt: new Date(), certificateCode: newCertificateCode() },
    });
  }
  const course = await db.course.findUnique({ where: { id: lesson.courseId }, select: { slug: true } });
  if (course) revalidatePath(`/learn/${course.slug}`);
  revalidatePath("/my-courses");
  revalidatePath("/dashboard");
}

export async function updateProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/profile");
  const parsed = z
    .object({
      name: z.string().trim().min(3, "اكتب اسمك بالكامل").max(80),
      phone: z.string().trim().regex(/^[0-9+\s-]{8,16}$/, "رقم الهاتف غير صحيح"),
    })
    .safeParse({ name: formData.get("name"), phone: formData.get("phone") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/profile");
  return { ok: true, message: "تم حفظ بياناتك" };
}

export async function changePasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/profile");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 8) return { error: "كلمة المرور الجديدة 8 أحرف على الأقل" };
  if (next !== confirm) return { error: "كلمتا المرور غير متطابقتين" };

  const rl = rateLimit(`pwd:${user.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return { error: "محاولات كثيرة. حاول لاحقًا" };

  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(current, row.passwordHash))) return { error: "كلمة المرور الحالية غير صحيحة" };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 11) } });
  return { ok: true, message: "تم تغيير كلمة المرور" };
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, safeNext } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/form-state";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

const registerSchema = z
  .object({
    name: z.string().trim().min(3, "اكتب اسمك بالكامل").max(80),
    email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{8,16}$/, "رقم الهاتف غير صحيح"),
    password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm"],
  });

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  const rl = rateLimit(`register:${ip}`, 8, 60 * 60 * 1000);
  if (!rl.ok) return { error: "محاولات كثيرة. حاول لاحقًا" };

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "هذا البريد مسجل بالفعل. سجّل الدخول" };

  const user = await db.user.create({
    data: { name, email, phone, passwordHash: await bcrypt.hash(password, 11) },
  });
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

const DUMMY_HASH = "$2a$11$7EqJtq98hPqEX7fNZaFWoOhi5BaOexwd8vFQ1U1b1G1rU3xq6Y0bK";

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "أدخل البريد وكلمة المرور" };

  const ip = await clientIp();
  const rl = rateLimit(`login:${ip}:${email}`, 8, 15 * 60 * 1000);
  if (!rl.ok) return { error: "محاولات كثيرة. حاول بعد قليل" };

  const user = await db.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) return { error: "البريد أو كلمة المرور غير صحيحة" };

  await createSession(user.id);
  redirect(safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/dashboard"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

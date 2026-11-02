import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";

export class WalletError extends Error {}

/**
 * Credit a pending top-up request. Guarded so double clicks / two admins
 * cannot credit the same request twice.
 */
export async function approveTopup(requestId: string, adminId: string, note = "") {
  return db.$transaction(async (tx) => {
    const req = await tx.topupRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new WalletError("الطلب غير موجود");

    const claimed = await tx.topupRequest.updateMany({
      where: { id: requestId, status: "PENDING" },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: adminId, adminNote: note },
    });
    if (claimed.count === 0) throw new WalletError("تمت مراجعة هذا الطلب بالفعل");

    const user = await tx.user.update({
      where: { id: req.userId },
      data: { balance: { increment: req.amount } },
      select: { balance: true },
    });
    await tx.walletTransaction.create({
      data: {
        userId: req.userId,
        type: "TOPUP",
        amount: req.amount,
        balanceAfter: user.balance,
        note: "شحن رصيد (تحويل)",
        refId: req.id,
      },
    });
    await tx.auditLog.create({
      data: { actorId: adminId, action: "TOPUP_APPROVED", detail: `${req.id} · ${req.amount}` },
    });
  });
}

export async function rejectTopup(requestId: string, adminId: string, note: string) {
  return db.$transaction(async (tx) => {
    const claimed = await tx.topupRequest.updateMany({
      where: { id: requestId, status: "PENDING" },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: adminId, adminNote: note },
    });
    if (claimed.count === 0) throw new WalletError("تمت مراجعة هذا الطلب بالفعل");
    await tx.auditLog.create({
      data: { actorId: adminId, action: "TOPUP_REJECTED", detail: `${requestId} · ${note}` },
    });
  });
}

/** Manual admin credit/debit with a ledger entry. */
export async function adjustBalance(userId: string, amount: number, note: string, adminId: string) {
  if (!Number.isInteger(amount) || amount === 0) throw new WalletError("مبلغ غير صالح");
  return db.$transaction(async (tx) => {
    if (amount < 0) {
      const ok = await tx.user.updateMany({
        where: { id: userId, balance: { gte: -amount } },
        data: { balance: { increment: amount } },
      });
      if (ok.count === 0) throw new WalletError("الرصيد غير كافٍ للخصم");
    } else {
      await tx.user.update({ where: { id: userId }, data: { balance: { increment: amount } } });
    }
    const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } });
    await tx.walletTransaction.create({
      data: {
        userId,
        type: "ADJUSTMENT",
        amount,
        balanceAfter: u.balance,
        note: note || "تعديل إداري",
      },
    });
    await tx.auditLog.create({
      data: { actorId: adminId, action: "BALANCE_ADJUST", detail: `${userId} · ${amount} · ${note}` },
    });
  });
}

/** Buy (or enroll in a free) course using wallet balance – atomic. */
export async function purchaseCourse(userId: string, courseId: string) {
  return db.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course || !course.published) throw new WalletError("الكورس غير متاح");

    const existing = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new WalletError("أنت مشترك في هذا الكورس بالفعل");

    if (course.price > 0) {
      const ok = await tx.user.updateMany({
        where: { id: userId, balance: { gte: course.price } },
        data: { balance: { decrement: course.price } },
      });
      if (ok.count === 0) throw new WalletError("رصيدك غير كافٍ. اشحن محفظتك أولًا");
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } });
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          amount: -course.price,
          balanceAfter: u.balance,
          note: `شراء كورس: ${course.title}`,
          refId: course.id,
        },
      });
    }

    await tx.enrollment.create({ data: { userId, courseId, pricePaid: course.price } });
    return course;
  });
}

/** Admin refund: removes enrollment and returns what was paid to the wallet. */
export async function refundEnrollment(enrollmentId: string, adminId: string) {
  return db.$transaction(async (tx) => {
    const en = await tx.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });
    if (!en) throw new WalletError("الاشتراك غير موجود");
    await tx.enrollment.delete({ where: { id: enrollmentId } });
    if (en.pricePaid > 0) {
      const u = await tx.user.update({
        where: { id: en.userId },
        data: { balance: { increment: en.pricePaid } },
        select: { balance: true },
      });
      await tx.walletTransaction.create({
        data: {
          userId: en.userId,
          type: "REFUND",
          amount: en.pricePaid,
          balanceAfter: u.balance,
          note: `استرداد: ${en.course.title}`,
          refId: en.courseId,
        },
      });
    }
    await tx.auditLog.create({
      data: { actorId: adminId, action: "REFUND", detail: `${en.userId} · ${en.courseId} · ${en.pricePaid}` },
    });
  });
}

export function newCertificateCode() {
  return `NIVO-${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

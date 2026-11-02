import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { saveLiveAction } from "@/app/actions/admin";
import { PLATFORMS } from "@/lib/constants";
import { toLocalInput } from "@/lib/utils";

type Live = {
  id: string; title: string; description: string; startsAt: Date; durationMin: number;
  platform: string; joinUrl: string; courseId: string | null; published: boolean;
};

export function LiveForm({ live, courses }: { live?: Live; courses: { id: string; title: string }[] }) {
  return (
    <ActionForm action={saveLiveAction} className="space-y-4">
      {live && <input type="hidden" name="id" value={live.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">عنوان الجلسة *</label>
          <input name="title" required defaultValue={live?.title} className="input" />
        </div>
        <div>
          <label className="label">الموعد (بتوقيت القاهرة) *</label>
          <input name="startsAt" type="datetime-local" required defaultValue={live ? toLocalInput(live.startsAt) : ""} className="input" />
        </div>
        <div>
          <label className="label">المدة (دقيقة)</label>
          <input name="durationMin" type="number" min={15} defaultValue={live?.durationMin ?? 60} className="input" />
        </div>
        <div>
          <label className="label">المنصة</label>
          <select name="platform" defaultValue={live?.platform ?? "ZOOM"} className="input">
            {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">الكورس المرتبط</label>
          <select name="courseId" defaultValue={live?.courseId ?? ""} className="input">
            <option value="">— متاحة لكل الطلاب —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">رابط الدخول</label>
          <input name="joinUrl" defaultValue={live?.joinUrl} dir="ltr" className="input text-end" placeholder="https://zoom.us/j/... أو رابط غرفة Jitsi" />
          <p className="hint">يظهر فقط للمشتركين في الكورس المرتبط (أو لكل الطلاب لو لم تربطه بكورس).</p>
        </div>
        <div className="md:col-span-2">
          <label className="label">وصف</label>
          <textarea name="description" rows={2} defaultValue={live?.description} className="input" />
        </div>
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-900">
        <input type="checkbox" name="published" defaultChecked={live?.published ?? true} className="h-5 w-5 accent-[#0A2A6B]" />
        منشورة
      </label>
      <div><SubmitButton className="btn-navy">{live ? "حفظ" : "إضافة الجلسة"}</SubmitButton></div>
    </ActionForm>
  );
}

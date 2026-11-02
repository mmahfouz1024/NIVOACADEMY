"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-black">حدث خطأ غير متوقع</h1>
      <p className="text-slate-600">نعتذر عن ذلك. حاول مرة أخرى.</p>
      <button onClick={reset} className="btn-gold">إعادة المحاولة</button>
    </div>
  );
}

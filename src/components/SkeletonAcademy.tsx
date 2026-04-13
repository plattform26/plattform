'use client';

export default function SkeletonAcademy() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-white animate-pulse overflow-hidden">
      {/* NAVBAR SKELETON (Slimmer) */}
      <nav className="h-16 bg-[#070d1a]/60 border-b border-white/5 flex items-center justify-between px-6 md:px-12">
        <div className="h-6 w-28 bg-white/5 rounded-lg"></div>
        <div className="flex gap-4">
            <div className="h-4 w-16 bg-white/5 rounded-full hidden md:block"></div>
            <div className="h-8 w-28 bg-white/10 rounded-full"></div>
        </div>
      </nav>

      {/* HERO SKELETON (Compact) */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-[35px] bg-white/5 mb-8"></div>
            <div className="space-y-3 w-full flex flex-col items-center">
                <div className="h-3 w-24 bg-blue-500/10 rounded-full mb-2"></div>
                <div className="h-10 w-2/3 max-w-md bg-white/5 rounded-xl"></div>
                <div className="h-5 w-1/3 bg-white/5 rounded-lg"></div>
                <div className="flex gap-3 pt-2">
                    <div className="h-8 w-20 bg-white/5 rounded-xl"></div>
                    <div className="h-8 w-24 bg-white/5 rounded-xl"></div>
                </div>
            </div>
        </div>
      </section>

      {/* METRICS SKELETON (Denser) */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-[#0d1524]/40 border border-white/5 rounded-[28px]"></div>
            ))}
        </div>
      </section>

      {/* CATALOG SKELETON (Dense Grid) */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="h-8 w-40 bg-white/5 rounded-lg mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-[#0d1524]/40 border border-white/5 rounded-[28px]"></div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}

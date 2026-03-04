import { BookOpen } from 'lucide-react';
import { TrongDong } from './TrongDong';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1b2d47]/30 to-[#1a1a1a]"></div>

      {/* ── Họa tiết trống đồng trái ── */}
      <div
        className="absolute -left-48 sm:-left-32 top-1/2 -translate-y-1/2 text-[#3b82c4] opacity-[0.07] pointer-events-none select-none"
        style={{ animation: 'slowSpin 90s linear infinite' }}
      >
        <TrongDong size={600} />
      </div>

      {/* ── Họa tiết trống đồng phải ── */}
      <div
        className="absolute -right-48 sm:-right-32 top-1/2 -translate-y-1/2 text-[#3b82c4] opacity-[0.07] pointer-events-none select-none"
        style={{ animation: 'slowSpinReverse 90s linear infinite' }}
      >
        <TrongDong size={600} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#3b82c4] blur-3xl opacity-20 rounded-full"></div>
              <BookOpen className="w-16 h-16 md:w-24 md:h-24 text-[#3b82c4] relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 tracking-wider text-[#3b82c4] uppercase">
            Bảo Tàng
          </h1>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-light mb-8 tracking-widest text-[#ccd8ef]">
            Văn Học Online
          </h2>

          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#3b82c4] to-transparent mx-auto mb-8"></div>

          <p className="text-base md:text-xl lg:text-2xl text-[#ccd8ef]/90 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Khám phá kho tàng văn học Việt Nam qua từng trang sách,
            từng dòng thơ, và từng câu chuyện bất hủ dành cho học sinh THCS
          </p>

          <button
            onClick={() => document.getElementById('authors')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-3 md:px-12 md:py-4 bg-transparent border-2 border-[#3b82c4] text-[#3b82c4] uppercase tracking-widest font-semibold overflow-hidden transition-all duration-500 hover:text-[#1a1a1a]"
          >
            <span className="relative z-10">Bước vào bảo tàng</span>
            <div className="absolute inset-0 bg-[#3b82c4] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
    </section>
  );
}

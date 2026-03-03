import { BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2c241b]/30 to-[#1a1a1a]"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#c89b3c] blur-3xl opacity-20 rounded-full"></div>
              <BookOpen className="w-24 h-24 text-[#c89b3c] relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-wider text-[#c89b3c] uppercase">
            Bảo Tàng
          </h1>
          <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-widest text-[#e0d8c8]">
            Văn Học Online
          </h2>

          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c89b3c] to-transparent mx-auto mb-8"></div>

          <p className="text-xl md:text-2xl text-[#e0d8c8]/90 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Khám phá kho tàng văn học Việt Nam qua từng trang sách,
            từng dòng thơ, và từng câu chuyện bất hủ dành cho học sinh THCS
          </p>

          <button className="group relative px-12 py-4 bg-transparent border-2 border-[#c89b3c] text-[#c89b3c] uppercase tracking-widest font-semibold overflow-hidden transition-all duration-500 hover:text-[#1a1a1a]">
            <span className="relative z-10">Bước vào bảo tàng</span>
            <div className="absolute inset-0 bg-[#c89b3c] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
    </section>
  );
}

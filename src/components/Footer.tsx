import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#3b82c4]/20 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#3b82c4]" strokeWidth={1.5} />
              <span className="text-base md:text-xl font-serif font-bold text-[#3b82c4] tracking-wider">
                BẢO TÀNG VĂN HỌC
              </span>
            </div>
            <p className="text-[#ccd8ef]/70 leading-relaxed">
              Nơi lưu giữ và chia sẻ những giá trị văn học Việt Nam cho thế hệ trẻ
            </p>
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-[#3b82c4] mb-4 tracking-wide uppercase">
              Danh Mục
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#authors" className="text-[#ccd8ef]/70 hover:text-[#3b82c4] transition-colors">
                  Tác giả
                </a>
              </li>
              <li>
                <a href="#works" className="text-[#ccd8ef]/70 hover:text-[#3b82c4] transition-colors">
                  Tác phẩm
                </a>
              </li>
              <li>
                <a href="#timeline" className="text-[#ccd8ef]/70 hover:text-[#3b82c4] transition-colors">
                  Dòng thời gian
                </a>
              </li>
              <li>
                <a href="#theory" className="text-[#ccd8ef]/70 hover:text-[#3b82c4] transition-colors">
                  Lí luận văn học
                </a>
              </li>
              <li>
                <a href="#comments" className="text-[#ccd8ef]/70 hover:text-[#3b82c4] transition-colors">
                  Bình luận
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-[#3b82c4] mb-4 tracking-wide uppercase">
              Về Dự Án
            </h3>
            <p className="text-[#ccd8ef]/70 leading-relaxed">
              Bảo tàng văn học online được xây dựng với mục đích hỗ trợ học sinh THCS
              trong việc học tập và khám phá văn học Việt Nam
            </p>
          </div>
        </div>

        <div className="border-t border-[#3b82c4]/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#ccd8ef]/60 text-sm">
              © 2024 Bảo Tàng Văn Học Online. Dự án giáo dục phi lợi nhuận.
            </p>
            <div className="flex items-center gap-2 text-[#ccd8ef]/60 text-sm">
              <span>Được xây dựng với</span>
              <Heart className="w-4 h-4 text-[#1a4f99] fill-[#1a4f99]" />
              <span>cho giáo dục Việt Nam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

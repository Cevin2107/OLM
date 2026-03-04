import { useState } from 'react';
import { Globe, MapPin, BookOpen, Clock, ExternalLink } from 'lucide-react';

interface Location {
  name: string;
  description: string;
  period: string;
  mapSrc: string;
  earthLink: string;
}

const locations: Location[] = [
  {
    name: 'Hà Nội',
    description:
      'Thủ đô ngàn năm văn hiến — nơi hội tụ nhiều nhà văn, nhà thơ lớn của nền văn học Việt Nam hiện đại. Trung tâm của phong trào Thơ Mới và văn xuôi lãng mạn 1930–1945.',
    period: 'Thế kỷ X – nay',
    mapSrc:
      'https://maps.google.com/maps?q=Hanoi,Vietnam&t=k&z=12&output=embed',
    earthLink:
      'https://earth.google.com/web/@21.0245,105.8412,15a,80000d,35y,0h,0t,0r',
  },
  {
    name: 'Huế',
    description:
      'Cố đô triều Nguyễn, cái nôi của thơ ca cung đình và văn học chữ Nôm. Nơi Nguyễn Du, Bà Huyện Thanh Quan và nhiều thi sĩ đã để lại dấu ấn sâu sắc.',
    period: 'Thế kỷ XVI – XIX',
    mapSrc:
      'https://maps.google.com/maps?q=Hue,Vietnam&t=k&z=12&output=embed',
    earthLink:
      'https://earth.google.com/web/@16.4637,107.5909,15a,80000d,35y,0h,0t,0r',
  },
  {
    name: 'Nam Định',
    description:
      'Quê hương của Tú Xương — nhà thơ trào phúng xuất sắc cuối thế kỷ XIX, đồng thời là vùng đất sinh ra nhiều nhân tài văn học đồng bằng Bắc Bộ.',
    period: 'Thế kỷ XIX – XX',
    mapSrc:
      'https://maps.google.com/maps?q=Nam+Dinh,Vietnam&t=k&z=12&output=embed',
    earthLink:
      'https://earth.google.com/web/@20.4388,106.1621,15a,80000d,35y,0h,0t,0r',
  },
  {
    name: 'Nghệ An – Hà Tĩnh',
    description:
      'Vùng đất địa linh nhân kiệt — nơi sinh ra Nguyễn Du (tác giả Truyện Kiều), Nguyễn Công Trứ và nhiều danh nhân văn hóa dân tộc.',
    period: 'Thế kỷ XVIII – XIX',
    mapSrc:
      'https://maps.google.com/maps?q=Nghi+Xuan,Ha+Tinh,Vietnam&t=k&z=11&output=embed',
    earthLink:
      'https://earth.google.com/web/@18.3796,105.7022,15a,120000d,35y,0h,0t,0r',
  },
];

export function GoogleEarthSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = locations[activeIndex];

  return (
    <section id="earth" className="py-24 bg-[#101827]">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-[#3b82c4]" strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3b82c4] tracking-wide">
              Bản Đồ Văn Học
            </h2>
          </div>
          <div className="w-24 h-px bg-[#3b82c4]/50 mx-auto mb-6" />
          <p className="text-[#9ab0d0] max-w-2xl mx-auto text-base leading-relaxed">
            Khám phá những vùng đất gắn liền với các tác phẩm văn học nổi tiếng.
            Hãy cùng nhìn lại không gian địa lý, bối cảnh lịch sử và nguồn cảm
            hứng sáng tác của các tác giả qua góc nhìn từ vệ tinh.
          </p>
        </div>

        {/* Location tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {locations.map((loc, idx) => (
            <button
              key={loc.name}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium tracking-wide transition-all duration-300 ${
                idx === activeIndex
                  ? 'bg-[#3b82c4] border-[#3b82c4] text-white shadow-lg shadow-[#3b82c4]/20'
                  : 'border-[#3b82c4]/30 text-[#9ab0d0] hover:border-[#3b82c4]/70 hover:text-[#ccd8ef]'
              }`}
            >
              <MapPin size={14} />
              {loc.name}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-[#1a2535] border border-[#3b82c4]/20 rounded-2xl p-6 flex flex-col gap-4 h-full">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3b82c4] mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ccd8ef] mb-1">
                    {active.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#3b82c4] font-medium uppercase tracking-wider">
                    <Clock size={12} />
                    {active.period}
                  </div>
                </div>
              </div>

              <p className="text-[#9ab0d0] text-sm leading-relaxed flex-1">
                {active.description}
              </p>

              <div className="border-t border-[#3b82c4]/10 pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-[#7b8fa8] uppercase tracking-wider font-semibold">
                  <BookOpen size={12} />
                  Xem trên Google Earth
                </div>
                <a
                  href={active.earthLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#3b82c4]/10 border border-[#3b82c4]/30 text-[#3b82c4] text-sm font-medium hover:bg-[#3b82c4]/20 hover:border-[#3b82c4]/60 transition-all duration-300"
                >
                  <Globe size={15} />
                  Mở trong Google Earth
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Historical note */}
            <div className="bg-[#1a2535] border border-[#3b82c4]/10 rounded-2xl p-5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#3b82c4] mb-3">
                Bối cảnh lịch sử
              </h4>
              <ul className="space-y-2 text-xs text-[#7b8fa8] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#3b82c4] shrink-0">▸</span>
                  Dùng bản đồ vệ tinh để quan sát địa hình, sông núi ảnh hưởng đến đời sống và sáng tác.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#3b82c4] shrink-0">▸</span>
                  So sánh cảnh quan ngày nay với mô tả trong tác phẩm văn học.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#3b82c4] shrink-0">▸</span>
                  Thu phóng để thấy bố cục không gian của từng vùng văn hóa.
                </li>
              </ul>
            </div>
          </div>

          {/* Map embed */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden border border-[#3b82c4]/20 shadow-2xl shadow-black/40"
              style={{ height: '520px' }}
            >
              {/* Decorative corner */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#101827]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#3b82c4]/20">
                <Globe size={13} className="text-[#3b82c4]" />
                <span className="text-xs text-[#9ab0d0] font-medium">
                  Chế độ vệ tinh • {active.name}
                </span>
              </div>

              <iframe
                key={active.name}
                src={active.mapSrc}
                title={`Bản đồ ${active.name}`}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Hint bar */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#7b8fa8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82c4] inline-block" />
                Kéo để di chuyển bản đồ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82c4]/50 inline-block" />
                Cuộn chuột để phóng to / thu nhỏ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82c4]/30 inline-block" />
                Nhấn nút bên trái để mở Google Earth 3D
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

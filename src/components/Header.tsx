import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', href: '#home' },
    { label: 'Tác giả', href: '#authors' },
    { label: 'Tác phẩm', href: '#works' },
    { label: 'Dòng thời gian', href: '#timeline' },
    { label: 'Lí luận văn học', href: '#theory' },
    { label: 'Bình luận', href: '#comments' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#3b82c4]/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#3b82c4]" strokeWidth={1.5} />
            <span className="text-base md:text-xl font-serif font-bold text-[#3b82c4] tracking-wider">
              BẢO TÀNG VĂN HỌC
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[#ccd8ef] hover:text-[#3b82c4] transition-colors duration-300 tracking-wide uppercase text-sm font-medium relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#3b82c4] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          <button
            className="md:hidden text-[#3b82c4]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-[#ccd8ef] hover:text-[#3b82c4] transition-colors duration-300 tracking-wide uppercase text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

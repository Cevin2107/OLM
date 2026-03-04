import { useEffect, useState } from 'react';
import { supabase, type Work, type MultimediaAsset } from '../lib/supabase';
import { Clock, ExternalLink, MapPin, Video, BookOpen, Palette, Archive, Link2 } from 'lucide-react';
import { MarkdownText } from '../lib/markdownText';

type Tab = 'analysis' | 'art' | 'media' | 'refs';

/**
 * Nội dung chi tiết của một tác phẩm – không có wrapper modal.
 * Dùng trong AuthorDetailModal (inline) và WorkDetailModal (full popup).
 */
export function WorkContentView({ work }: { work: Work }) {
  const [assets, setAssets] = useState<MultimediaAsset[]>([]);
  const [tab, setTab] = useState<Tab>('analysis');

  useEffect(() => {
    supabase
      .from('multimedia_assets')
      .select('*')
      .eq('work_id', work.id)
      .then(({ data }) => setAssets(data || []));
  }, [work.id]);

  const imageAssets = assets.filter((a) => a.asset_type === 'image');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'analysis', label: 'Nội dung',   icon: <BookOpen size={13} /> },
    { key: 'art',      label: 'Nghệ thuật', icon: <Palette size={13} />  },
    { key: 'media',    label: 'Tư liệu',    icon: <Archive size={13} />  },
    { key: 'refs',     label: 'Tham khảo',  icon: <Link2 size={13} />    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Meta badges ── */}
      <div className="flex flex-wrap items-center gap-2">
        {work.period && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b2d47] text-[#3b82c4] text-sm font-medium rounded-full">
            <Clock size={12} />
            {work.period.period_name}
            {work.period.start_year && work.period.end_year && (
              <span className="text-[#3b82c4]/70">
                ({work.period.start_year}–{work.period.end_year})
              </span>
            )}
          </span>
        )}
        {work.composition_year && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a4f99]/15 text-[#1a4f99] text-sm font-medium rounded-full border border-[#1a4f99]/20">
            <Clock size={12} />
            Sáng tác: {work.composition_year}
          </span>
        )}
        {work.genre && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a2e50]/60 text-emerald-400 text-sm font-medium rounded-full">
            {work.genre.name}
          </span>
        )}
      </div>

      {/* ── Trích dẫn nổi bật ── */}
      {work.excerpt && (
        <blockquote className="border-l-4 border-[#3b82c4] pl-5 py-1 italic text-[#1c1c1c]/80 text-lg leading-relaxed">
          "{work.excerpt}"
        </blockquote>
      )}

      {/* ── Tab bar ── */}
      <div className="flex gap-0.5 border-b border-[#3b82c4]/20">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-[#3b82c4] text-[#1a4f99]'
                : 'border-transparent text-[#1c1c1c]/50 hover:text-[#1c1c1c]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Nội dung ── */}
      <div key={tab} className="tab-panel">
      {tab === 'analysis' && (
        <div className="space-y-5">
          {work.writing_context && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Hoàn cảnh sáng tác
              </h4>
              <MarkdownText text={work.writing_context} />
            </div>
          )}
          {work.content_summary && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Nội dung
              </h4>
              <MarkdownText text={work.content_summary} />
            </div>
          )}
          {!work.writing_context && !work.content_summary && (
            <p className="text-sm text-[#1c1c1c]/40 italic py-4 text-center">Chưa có nội dung phân tích.</p>
          )}
        </div>
      )}

      {/* ── Nghệ thuật ── */}
      {tab === 'art' && (
        <div className="space-y-5">
          {work.art_features && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Đặc sắc nghệ thuật
              </h4>
              <MarkdownText text={work.art_features} />
            </div>
          )}
          {work.significance && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Ý nghĩa / Giá trị
              </h4>
              <MarkdownText text={work.significance} />
            </div>
          )}
          {!work.art_features && !work.significance && (
            <p className="text-sm text-[#1c1c1c]/40 italic py-4 text-center">Chưa có thông tin nghệ thuật.</p>
          )}
        </div>
      )}

      {/* ── Tư liệu ── */}
      {tab === 'media' && (
        <div className="space-y-6">
          {work.youtube_embed_id && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                <Video size={15} /> Video giảng giải
              </h4>
              <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${work.youtube_embed_id}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}
          {imageAssets.length > 0 && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Ảnh tư liệu
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imageAssets.map((a) => (
                  <a key={a.id} href={a.catbox_url} target="_blank" rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-[#3b82c4]/20 hover:border-[#3b82c4] transition-colors">
                    <img src={a.catbox_url} alt={a.description || ''} className="w-full h-36 object-cover"
                      onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')} />
                    {a.description && (
                      <p className="text-xs text-[#1c1c1c]/70 px-2 py-1.5">{a.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
          {work.map_coordinates && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                <MapPin size={15} /> Bối cảnh địa lý
              </h4>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe src={`https://www.google.com/maps?q=${work.map_coordinates}&output=embed&z=15`}
                  className="w-full h-full" loading="lazy" />
              </div>
            </div>
          )}
          {!work.youtube_embed_id && imageAssets.length === 0 && !work.map_coordinates && (
            <p className="text-sm text-[#1c1c1c]/40 italic py-4 text-center">Chưa có tư liệu đa phương tiện.</p>
          )}
        </div>
      )}

      {/* ── Tham khảo ── */}
      {tab === 'refs' && (
        <div className="space-y-5">
          {work.content_html && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                Nội dung chi tiết
              </h4>
              <MarkdownText text={work.content_html} poem={work.content_type === 'poem'} />
            </div>
          )}
          {work.reference_links && work.reference_links.length > 0 && (
            <div>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-[#1a4f99] mb-4 pb-2 border-b-2 border-[#3b82c4]/40">
                <span className="w-1.5 h-6 rounded-full bg-[#3b82c4] inline-block flex-shrink-0"></span>
                <ExternalLink size={15} /> Tài liệu tham khảo
              </h4>
              <ul className="space-y-2">
                {work.reference_links.map((link, i) => (
                  <li key={i}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#1a4f99] hover:text-[#3b82c4] transition-colors text-sm font-medium underline underline-offset-2">
                      <ExternalLink size={13} />
                      {link.title || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!work.content_html && (!work.reference_links || work.reference_links.length === 0) && (
            <p className="text-sm text-[#1c1c1c]/40 italic py-4 text-center">Chưa có tài liệu tham khảo.</p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HomeHeroSlider: React.FC = () => {
  const { banners, setActiveView, setSelectedCategory } = useShop();
  const sliderBanners = banners.filter((b) => b.type === 'slider' && b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

  if (sliderBanners.length === 0) return null;

  const current = sliderBanners[currentIndex] || sliderBanners[0];

  const handleBannerAction = () => {
    if (current.linkUrl === '#packs') {
      setSelectedCategory('service_pack');
      setActiveView('shop');
    } else {
      setActiveView('shop');
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200/60 aspect-[16/8] sm:aspect-[21/8] md:aspect-[24/8] min-h-[240px] sm:min-h-[300px]">
        {/* پس‌زمینه حرفه‌ای و مقاوم در برابر فیلترینگ با گرادیان نوین فیلتر و نورپردازی */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-950 to-sky-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          {/* لوگوی درخشان نوین فیلتر در پس‌زمینه بنر */}
          <div className="absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 opacity-25 lg:opacity-40 pointer-events-none transform rotate-6">
            <img
              src="/assets/aistudio/1000030421_ab989be0.png"
              alt=""
              className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]"
            />
          </div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* محتوای متن روی بنر */}
        <div className="relative h-full z-10 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl text-white">
          {current.badgeText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 backdrop-blur-xs text-slate-950 text-xs font-bold rounded-full w-fit mb-2 sm:mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{current.badgeText}</span>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 sm:mb-3 drop-shadow-sm">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {current.subtitle}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBannerAction}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <span>مشاهده و خرید با تخفیف</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>تضمین اصالت قطعات</span>
            </div>
          </div>
        </div>

        {/* دکمه‌های ناوبری اسلایدر */}
        {sliderBanners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xs transition z-20"
              aria-label="بنر قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % sliderBanners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xs transition z-20"
              aria-label="بنر بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* نقاط ناوبری */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {sliderBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`اسلاید ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { resolveAssetUrl } from '../utils/assetHelper';

export const HomeHeroSlider: React.FC = () => {
  const { banners, cars, setActiveView, setSelectedCategory, setActiveCarFilter } = useShop();
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
      setActiveCarFilter('all');
      setSelectedCategory('service_pack');
    } else if (current.linkUrl.startsWith('#car-')) {
      const matchedCar = cars.find((c) => `#car-${c.id}` === current.linkUrl);
      setSelectedCategory('all');
      setActiveCarFilter(matchedCar ? matchedCar.name : 'all');
    }
    setActiveView('shop');
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const resolvedBannerImg = resolveAssetUrl(current.imageUrl);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || sliderBanners.length <= 1) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diffX) > 45) {
      if (diffX > 0) {
        setCurrentIndex((prev) => (prev + 1) % sliderBanners.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length);
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200/80 min-h-[235px] sm:min-h-[290px] md:min-h-[320px] lg:aspect-[24/8]"
      >
        {/* پس‌زمینه تصویر عکاسی واقعی و گرادیان تاریک اختصاصی */}
        {resolvedBannerImg ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={resolvedBannerImg}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {/* گرادیان سایه راست‌به‌چپ برای خوانایی عالی متن فارسی در سمت راست و نمایش شفاف خودرو/روغن در سمت چپ */}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/92 via-slate-950/65 to-slate-950/15" />
            <div className="absolute inset-0 bg-blue-950/15 mix-blend-multiply" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-950 to-sky-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          </div>
        )}

        {!resolvedBannerImg && (
          <div className="hidden sm:block absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 w-44 h-44 lg:w-64 lg:h-64 opacity-20 pointer-events-none transform rotate-6">
            <img
              src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
              alt=""
              className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]"
            />
          </div>
        )}

        {/* محتوای متن روی بنر */}
        <div className="relative h-full z-10 flex flex-col justify-center px-5 sm:px-14 md:px-16 max-w-2xl text-white pt-5 pb-11 sm:py-6">
          {current.badgeText && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black rounded-full w-fit mb-2 sm:mb-3 shadow-xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
              <span>{current.badgeText}</span>
            </div>
          )}

          <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-snug mb-1.5 sm:mb-3 drop-shadow-sm">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 mb-3.5 sm:mb-6 line-clamp-2 leading-relaxed font-normal">
            {current.subtitle}
          </p>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleBannerAction}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 sm:gap-2"
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

        {/* دکمه‌های ناوبری اسلایدر (فقط دسکتاپ/تبلت؛ در موبایل سوایپ و نقاط ناوبری فعال است) */}
        {sliderBanners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length)
              }
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xs transition z-20"
              aria-label="بنر قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % sliderBanners.length)}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xs transition z-20"
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

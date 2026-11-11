import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  Truck,
  PhoneCall,
  Search,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HomeHeroSlider } from './HomeHeroSlider';
import { VehicleQuickFilter } from './VehicleQuickFilter';
import { ServicePacksSection } from './ServicePacksSection';
import { ProductCard } from './ProductCard';
import { filterProducts, getCategoryTitle, toPersianDigits } from '../utils/shopUtils';
import { ProductCategory } from '../types';

export const ShopHomeView: React.FC = () => {
  const {
    products,
    banners,
    selectedCategory,
    setSelectedCategory,
    activeCarFilter,
    setActiveCarFilter,
    searchQuery,
    setSearchQuery,
    siteSettings,
  } = useShop();

  const [activeTag, setActiveTag] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // فیلتر کردن محصولات
  const filteredProducts = filterProducts(products, {
    category: selectedCategory,
    carModel: activeCarFilter,
    searchQuery,
    onlyInStock,
    tag: activeTag === 'all' ? undefined : activeTag,
  });

  const promoBanners = banners.filter((b) => b.type === 'promo_card' && b.isActive);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* ۱. اسلایدر عریض بنرهای تبلیغاتی */}
      <HomeHeroSlider />

      {/* ۲. فیلتر سریع بر اساس خودرو */}
      <VehicleQuickFilter />

      {/* ۳. بخش اختصاصی پک‌های سرویس دوره‌ای اقتصادی */}
      {selectedCategory === 'all' || selectedCategory === 'service_pack' ? (
        <ServicePacksSection />
      ) : null}

      {/* بنرهای میانی تبلیغاتی (۲ تایی با نسبت ۲:۱) */}
      {promoBanners.length >= 2 && (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {promoBanners.slice(0, 2).map((promo) => (
            <div
              key={promo.id}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 aspect-[21/9] sm:aspect-[24/9] flex items-center p-6 text-white group cursor-pointer"
              onClick={() => {
                if (promo.linkUrl.includes('206')) {
                  setActiveCarFilter('پژو ۲۰۶ (TU3 / TU5)');
                } else if (promo.linkUrl.includes('pride')) {
                  setActiveCarFilter('پراید (تمام مدل‌ها)');
                }
              }}
            >
              {promo.imageUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      promo.id === 'banner-promo-1'
                        ? 'from-slate-950 via-slate-950/85 to-blue-950/30'
                        : 'from-slate-950 via-slate-950/85 to-amber-950/30'
                    }`}
                  />
                </div>
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    promo.id === 'banner-promo-1'
                      ? 'from-blue-950 via-blue-900 to-sky-800'
                      : 'from-amber-950 via-amber-900 to-amber-700'
                  }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl" />
                </div>
              )}

              <div className="relative z-10 max-w-sm">
                {promo.badgeText && (
                  <span className="inline-block text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md mb-2">
                    {promo.badgeText}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-black leading-snug mb-1">
                  {promo.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {promo.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ۴. ویترین اصلی کاتالوگ محصولات */}
      <section id="products" className="max-w-7xl mx-auto px-4">
        {/* نوار فیلتر و هدر کاتالوگ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {getCategoryTitle(selectedCategory)}
                </h2>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                  {toPersianDigits(filteredProducts.length)} کالا
                </span>
              </div>
              {activeCarFilter !== 'all' && (
                <p className="text-xs text-blue-700 font-medium mt-1">
                  فیلتر فعال بر اساس خودرو: {activeCarFilter}
                </p>
              )}
            </div>

            {/* تب‌های تگ (ویژه، پرفروش، اقتصادی) و چک‌باکس فقط کالاهای موجود */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTag('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTag === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  همه
                </button>
                <button
                  onClick={() => setActiveTag('ویژه')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTag === 'ویژه' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ویژه
                </button>
                <button
                  onClick={() => setActiveTag('پرفروش')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTag === 'پرفروش' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  پرفروش‌ترین‌ها
                </button>
                <button
                  onClick={() => setActiveTag('اقتصادی')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTag === 'اقتصادی' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  اقتصادی
                </button>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 font-medium bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span>فقط کالاهای موجود</span>
              </label>

              {(activeCarFilter !== 'all' || searchQuery || selectedCategory !== 'all' || activeTag !== 'all' || onlyInStock) && (
                <button
                  onClick={() => {
                    setActiveCarFilter('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setActiveTag('all');
                    setOnlyInStock(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                  title="پاک کردن همه فیلترها"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* لیست شبکه‌ای محصولات */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              محصولی با این مشخصات یافت نشد
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              می‌توانید فیلتر خودرو یا عبارت جستجو را تغییر دهید یا همه محصولات را مشاهده فرمایید.
            </p>
            <button
              onClick={() => {
                setActiveCarFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
                setActiveTag('all');
                setOnlyInStock(false);
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              نمایش کلیه محصولات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ۵. بخش مزایای نوین فیلتر و راهنمای تخصصی خرید */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-gradient-to-tr from-blue-50 via-sky-50 to-amber-50 rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 mb-2 inline-block">
              چرا خرید از نوین فیلتر؟
            </span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900">
              تخصص، اصالت تضمین‌شده و پشتیبانی فنی بی‌واسطه
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              روغن و فیلتر شریان حیاتی موتور خودرو هستند. ما در نوین فیلتر اصالت هر قطره روغن و استاندارد هر فیلتر را ضمانت می‌کنیم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                تضمین ۱۰۰٪ پلمپ فیزیکی و اصالت
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                کلیه اقلام مستقیماً از پالایشگاه‌ها و شرکت‌های معتبر (بهران، کاسترول، سرکان) با هولوگرام لیزری و بارکد اختصاصی تامین می‌گردند.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                ارسال ایمن در {siteSettings.deliveryTimeEstimate}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                بسته‌بندی ضربه‌گیر ویژه کالاهای مایع و ارسال به کلیه نقاط ایران با پست پیشتاز و تیپاکس به همراه شناسه پستی پیامکی.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                مشاوره فنی رایگان انتخاب روغن
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                نمی‌دانید چه ویسکوزیته‌ای برای خودروی شما مناسب است؟ کارشناسان ما آماده پاسخگویی آنلاین و تلفنی به شما هستند.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

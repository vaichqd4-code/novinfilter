import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ShieldCheck,
  Truck,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { toPersianDigits } from '../utils/shopUtils';
import { ProductCategory } from '../types';

export const Header: React.FC = () => {
  const {
    cartTotals,
    setIsCartDrawerOpen,
    setIsAuthModalOpen,
    currentUser,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeView,
    setActiveView,
    siteSettings,
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // بستن اسکرول صفحه هنگام باز بودن منوی موبایل
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const categories: { key: ProductCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'همه محصولات' },
    { key: 'service_pack', label: 'پک‌های سرویس اقتصادی' },
    { key: 'engine_oil', label: 'روغن موتور' },
    { key: 'oil_filter', label: 'فیلتر روغن' },
    { key: 'air_filter', label: 'فیلتر هوا' },
    { key: 'cabin_filter', label: 'فیلتر اتاق (کابین)' },
    { key: 'gearbox_oil', label: 'روغن گیربکس' },
  ];

  const handleSelectCategory = (cat: ProductCategory | 'all') => {
    setSelectedCategory(cat);
    setMobileMenuOpen(false);
    if (activeView !== 'shop') {
      setActiveView('shop');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        {/* نوار بالایی هدر - پیام‌های اطمینان و تماس مشتری */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 text-white text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                ضمانت ۱۰۰٪ اصالت و پلمپ فیزیکی کلیه کالاها
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-blue-100">
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                ارسال به سراسر کشور در {siteSettings.deliveryTimeEstimate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${siteSettings.phone}`}
                className="flex items-center gap-1.5 text-blue-50 hover:text-white transition font-mono font-bold"
                dir="ltr"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                {siteSettings.phone}
              </a>
            </div>
          </div>
        </div>

        {/* بخش میانی هدر - منو همبرگری، لوگو، جستجو و سبد خرید */}
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* دکمه منوی همبرگری موبایل */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition"
              aria-label="باز کردن منوی دسته‌بندی‌ها"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* لوگوی نوین فیلتر */}
            <button
              onClick={() => {
                setActiveView('shop');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-2.5 group text-right focus:outline-none"
            >
              <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-blue-600 to-amber-400 shadow-md group-hover:scale-105 transition-transform duration-200 overflow-hidden flex-shrink-0">
                <img
                  src="/assets/aistudio/1000030421_ab989be0.png"
                  alt="لوگوی نوین فیلتر"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <div className="h-6 sm:h-7 flex items-center">
                  <img
                    src="/assets/aistudio/1000030476_830ce030.jpg"
                    alt="تایپوگرافی نوین فیلتر"
                    className="h-full object-contain filter contrast-125"
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-tight">
                  مرکز تخصصی روغن و فیلتر خودرو
                </span>
              </div>
            </button>

            {/* فیلد جستجوی پیشرفته (دسکتاپ) */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeView !== 'shop') setActiveView('shop');
                  }}
                  placeholder="جستجوی خودرو (۲۰۶، دنا، پراید)، نام فیلتر یا گرانروی روغن (10W-40)..."
                  className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
                <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* دکمه‌های ورود و سبد خرید */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="max-w-[120px] truncate">{currentUser.name || currentUser.phone}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-100/90 hover:bg-blue-50 border border-slate-200/90 rounded-xl transition"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">ورود به حساب</span>
                  <span className="sm:hidden">ورود</span>
                </button>
              )}

              {/* سبد خرید با شمارنده زنده */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl shadow-xs hover:shadow transition font-bold text-xs sm:text-sm"
                aria-label="سبد خرید"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">سبد خرید</span>
                {cartTotals.totalQuantity > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-xs">
                    {toPersianDigits(cartTotals.totalQuantity)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* فیلد جستجوی موبایل */}
          <div className="mt-2.5 md:hidden">
            <div className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'shop') setActiveView('shop');
                }}
                placeholder="جستجوی خودرو، روغن یا فیلتر..."
                className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* نوار ناوبری دسته‌بندی‌ها (دسکتاپ) */}
        <nav className="hidden md:block bg-slate-50/90 border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <ul className="flex items-center gap-1.5 py-2 text-xs lg:text-sm font-semibold text-slate-700 overflow-x-auto">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                const isPack = cat.key === 'service_pack';
                return (
                  <li key={cat.key}>
                    <button
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isPack
                          ? 'text-amber-800 bg-amber-100/70 hover:bg-amber-100 font-bold border border-amber-300'
                          : 'hover:bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      {isPack && <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />}
                      {cat.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <button
                onClick={() => setActiveView('legal_faq')}
                className="hover:text-blue-600 transition"
              >
                راهنمای انتخاب روغن
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveView('legal_shipping')}
                className="hover:text-blue-600 transition"
              >
                رویه ارسال سفارش
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* منوی کشویی همبرگری موبایل کاملاً ایزوله با z-index فوق‌العاده بالا */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] md:hidden overflow-hidden" dir="rtl">
          {/* پس‌زمینه تیره */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* کشو از سمت راست به داخل باز می‌شود */}
          <div className="fixed inset-y-0 right-0 w-[290px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
            <div>
              {/* هدر منوی موبایل */}
              <div className="p-4 bg-gradient-to-r from-blue-700 to-sky-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/1000030421_ab989be0.png"
                    alt="نوین فیلتر"
                    className="w-8 h-8 rounded-lg border border-white/20"
                  />
                  <div>
                    <h3 className="font-black text-sm">نوین فیلتر</h3>
                    <p className="text-[10px] text-blue-100">فروشگاه تخصصی روغن و فیلتر</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                  aria-label="بستن منوی موبایل"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* لیست دسته‌بندی‌ها */}
              <div className="p-4">
                <span className="text-xs font-bold text-slate-400 block mb-2 px-1">
                  دسته‌بندی محصولات
                </span>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                        selectedCategory === cat.key
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.key === 'service_pack' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black">
                          تخفیف ویژه
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* لینک‌های راهنما */}
              <div className="px-4 py-3 border-t border-slate-100 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveView('legal_faq');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right text-slate-600 py-2 px-2 hover:bg-slate-50 rounded-lg font-medium"
                >
                  راهنمای انتخاب ویسکوزیته مناسب
                </button>
                <button
                  onClick={() => {
                    setActiveView('legal_shipping');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right text-slate-600 py-2 px-2 hover:bg-slate-50 rounded-lg font-medium"
                >
                  رویه ارسال و بسته‌بندی در ۷ روز کاری
                </button>
                <button
                  onClick={() => {
                    setActiveView('legal_terms');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right text-slate-600 py-2 px-2 hover:bg-slate-50 rounded-lg font-medium"
                >
                  ضمانت اصالت و شرایط مرجوعی
                </button>
              </div>
            </div>

            {/* فوتر منوی موبایل */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
              <p className="text-slate-500 text-[11px]">تماس و پشتیبانی مشتریان:</p>
              <a
                href={`tel:${siteSettings.phone}`}
                className="font-mono mt-1 text-blue-700 font-bold block"
                dir="ltr"
              >
                {siteSettings.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

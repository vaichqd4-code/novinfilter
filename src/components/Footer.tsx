import React from 'react';
import {
  PhoneCall,
  Send,
  Instagram,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { resolveAssetUrl } from '../utils/assetHelper';

export const Footer: React.FC = () => {
  const { siteSettings, setActiveView, setSelectedCategory } = useShop();

  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
      {/* بخش مزایای کلیدی نوین فیلتر */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-300">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">ضمانت اصالت ۱۰۰٪</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">اصالت فیزیکی و آزمایشگاهی</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">ارسال به سراسر کشور</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">در {siteSettings.deliveryTimeEstimate} با پست پیشتاز</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">ضمانت ۷ روزه مرجوعی</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">برای کالاهای بازنشده و پلمپ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">مشاوره فنی پیشرانه</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono" dir="ltr">{siteSettings.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* لینک‌ها و معرفی برند */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* ستون ۱: معرفی برند نوین فیلتر */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 shadow-md flex-shrink-0">
                <img
                  src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
                  alt="لوگوی نوین فیلتر"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white tracking-tight">نوین فیلتر</span>
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">NOVIN FILTER</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                  مرکز تخصصی روغن موتور، انواع فیلتر و پک‌های دوره‌ای
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-justify">
              مجموعه نوین فیلتر با تمرکز بر توزیع بی‌واسطه مرغوب‌ترین روغن‌های موتور داخلی و وارداتی، فیلترهای روغن استاندارد، فیلترهای هوای تنفسی و پک‌های کامل سرویس دوره‌ای، آرامش خیال و سلامت موتور خودروی شما را تضمین می‌کند.
            </p>

            {/* شبکه‌های اجتماعی */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <a
                href={`https://instagram.com/${siteSettings.instagramId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>اینستاگرام: {siteSettings.instagramId}</span>
              </a>

              <a
                href={`https://t.me/${siteSettings.telegramId.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>تلگرام: {siteSettings.telegramId}</span>
              </a>
            </div>
          </div>

          {/* ستون ۲: دسترسی سریع به کاتالوگ */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold text-white tracking-wider pb-2 border-b border-slate-800">
              دسته‌بندی‌های اصلی
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('service_pack');
                    setActiveView('shop');
                  }}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>پک‌های سرویس اقتصادی</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('engine_oil');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition"
                >
                  روغن موتور خودرو
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('oil_filter');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition"
                >
                  فیلتر روغن
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('air_filter');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition"
                >
                  فیلتر هوا
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cabin_filter');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition"
                >
                  فیلتر اتاق (کابین)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('gearbox_oil');
                    setActiveView('shop');
                  }}
                  className="hover:text-white transition"
                >
                  روغن جعبه دنده (واسکازین)
                </button>
              </li>
            </ul>
          </div>

          {/* ستون ۳: خدمات مشتریان و بخش‌های قانونی */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-white tracking-wider pb-2 border-b border-slate-800">
              قوانین و خدمات مشتریان
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveView('legal_terms')}
                  className="hover:text-white transition"
                >
                  قوانین و رویه مرجوعی کالای خودرویی
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('legal_shipping')}
                  className="hover:text-white transition"
                >
                  رویه ارسال و بسته‌بندی ضدضربه
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('legal_faq')}
                  className="hover:text-white transition"
                >
                  پرسش‌های متداول و راهنمای انتخاب روغن
                </button>
              </li>
            </ul>
          </div>

          {/* ستون ۴: ارتباط مستقیم */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-white tracking-wider pb-2 border-b border-slate-800">
              ارتباط مستقیم با کارشناسان
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-white font-mono font-bold" dir="ltr">
                  {siteSettings.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{siteSettings.supportHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>زمان تحویل سفارش‌ها: {siteSettings.deliveryTimeEstimate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* کپی‌رایت رسمی */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 text-center sm:text-right text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-between gap-4">
          <div className="flex items-center justify-center gap-2">
            <p>
              تمامی حقوق مادی و معنوی این وب‌سایت متعلق به برند نوین فیلتر است © ۱۴۰۵
            </p>
            {/* دسترسی محرمانه و بدون جلب توجه ادمین */}
            <button
              onClick={() => setActiveView('admin')}
              className="text-slate-600 hover:text-slate-400 p-1 rounded transition opacity-20 hover:opacity-100"
              title="ورود مدیریت"
              aria-label="ورود مدیریت"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            فروشگاه تخصصی نوین فیلتر | ضمانت ۱۰۰٪ اصالت فیزیکی و آزمایشگاهی کلیه کالاها
          </p>
        </div>
      </div>
    </footer>
  );
};

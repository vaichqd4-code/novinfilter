import React from 'react';
import {
  Sparkles,
  PackageCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { Product } from '../types';
import { ProductImage } from './ProductImage';
import { useShop } from '../context/ShopContext';
import { formatPrice, toPersianDigits } from '../utils/shopUtils';

export const ServicePacksSection: React.FC = () => {
  const { products, addToCart, openProductDetail } = useShop();

  const servicePacks = products.filter((p) => p.isServicePack && p.isAvailable);

  if (servicePacks.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10">
      <div className="bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-700/50">
        {/* المان‌های تزئینی پس‌زمینه */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* تیتر بخش */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full mb-2 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>پیشنهاد اقتصادی ویژه نوین فیلتر</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              پک‌های سرویس دوره‌ای اقتصادی (تعویض روغنی کامل)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              خرید همزمان روغن موتور + فیلتر روغن + فیلتر هوا با تخفیف مضاعف پکی، تضمین اصالت و بدون دردسر جستجو برای تک‌تک فیلترها
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/10 text-xs text-amber-300 font-semibold">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <span>تا ۲۵٪ صرفه‌جویی اقتصادی</span>
          </div>
        </div>

        {/* کارت‌های پک‌های اقتصادی */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicePacks.slice(0, 3).map((pack) => {
            const baseDiscounted = (pack.price * (100 - pack.discountPercent)) / 100;
            const extraPackDiscount = pack.packDiscountAdditional || 10;
            const finalPackPrice = Math.round(baseDiscounted * (1 - extraPackDiscount / 100));

            return (
              <div
                key={pack.id}
                className="bg-white/95 text-slate-900 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition duration-300 border border-white/80"
              >
                <div>
                  {/* هدر کارت */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                      {pack.brand}
                    </span>
                    <span className="text-[11px] font-black text-amber-950 bg-amber-400 px-2.5 py-0.5 rounded-lg shadow-xs">
                      {toPersianDigits(pack.discountPercent + extraPackDiscount)}٪ تخفیف کل
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mb-2 leading-snug">
                    {pack.title}
                  </h3>

                  {/* تصویر پک */}
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-200 p-2">
                    <ProductImage
                      src={pack.image}
                      alt={pack.title}
                      category={pack.category}
                      title={pack.title}
                      brand={pack.brand}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* اقلام موجود در پک */}
                  <div className="space-y-1.5 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>محتویات درون پک:</span>
                    </div>
                    {pack.packIncludes?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* قیمت و دکمه‌های اقدام */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <div className="text-xs text-slate-400 line-through">
                        {formatPrice(pack.price)}
                      </div>
                      <div className="text-lg font-black text-blue-700">
                        {formatPrice(finalPackPrice)}
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      ارسال با پست پیشتاز
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(pack, 'pack', 1)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                    >
                      خرید کل پک
                    </button>
                    <button
                      onClick={() => openProductDetail(pack.id)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      بررسی فنی
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

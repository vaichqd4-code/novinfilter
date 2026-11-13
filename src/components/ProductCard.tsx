import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Star,
  Plus,
  Check,
  Layers,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Product } from '../types';
import { ProductImage } from './ProductImage';
import {
  calculateDiscountedPrice,
  formatPrice,
  toPersianDigits,
} from '../utils/shopUtils';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openProductDetail } = useShop();
  const [isAdded, setIsAdded] = useState(false);

  const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercent);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default to 'pack' for service packs, and 'single' for regular items
    addToCart(product, product.isServicePack ? 'pack' : 'single', 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      onClick={() => openProductDetail(product.id)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* برچسب‌های بالایی */}
      <div className="absolute top-2.5 right-2.5 left-2.5 flex items-start justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.discountPercent > 0 && (
            <span className="bg-rose-500 text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md shadow-2xs">
              {toPersianDigits(product.discountPercent)}٪ تخفیف
            </span>
          )}
          {product.isServicePack && (
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950" />
              پک اقتصادی
            </span>
          )}
        </div>

        {product.tags.length > 0 && !product.isServicePack && (
          <span className="bg-blue-600/90 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
            {product.tags[0]}
          </span>
        )}
      </div>

      {/* تصویر محصول با کامپوننت هوشمند ProductImage */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-2.5 sm:p-4 flex items-center justify-center">
        <ProductImage
          src={product.image}
          alt={product.title}
          category={product.category}
          title={product.title}
          viscosity={product.technicalSpecs?.viscosity}
          brand={product.brand}
          className="w-full h-full object-contain md:group-hover:scale-105 transition-transform duration-300"
        />
        <div className="hidden md:flex absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            مشاهده جزییات
          </span>
        </div>
      </div>

      {/* اطلاعات محصول */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* برند و امتیاز */}
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md truncate">
              {product.brand}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold flex-shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span>{toPersianDigits(product.rating)}</span>
              <span className="hidden sm:inline text-[10px] text-slate-400">
                ({toPersianDigits(product.reviewsCount)})
              </span>
            </div>
          </div>

          {/* عنوان کالا */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors mb-2 min-h-[2.4em]">
            {product.title}
          </h3>

          {/* سازگاری و ویژگی‌های برجسته */}
          <div className="flex flex-wrap gap-1 mb-2.5 sm:mb-3">
            {product.technicalSpecs.viscosity && (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded-md">
                SAE {product.technicalSpecs.viscosity}
              </span>
            )}
            {product.compatibleCars.length > 0 && (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-full">
                {product.compatibleCars[0]}
                {product.compatibleCars.length > 1 && ` + ${toPersianDigits(product.compatibleCars.length - 1)}`}
              </span>
            )}
          </div>
        </div>

        {/* قیمت و دکمه خرید */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
            <div>
              {product.discountPercent > 0 && (
                <div className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  {formatPrice(product.price)}
                </div>
              )}
              <div className="text-xs sm:text-base font-extrabold text-slate-900">
                {formatPrice(discountedPrice)}
              </div>
            </div>

            <div className="hidden sm:flex text-[10px] text-emerald-600 font-semibold items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>اصالت ۱۰۰٪</span>
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            className={`w-full py-2 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition duration-200 shadow-xs ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>اضافه شد</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{product.isServicePack ? 'خرید پک' : 'افزودن به سبد'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

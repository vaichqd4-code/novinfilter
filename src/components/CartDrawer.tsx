import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  formatPrice,
  getItemUnitPrice,
  toPersianDigits,
} from '../utils/shopUtils';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    cartTotals,
    setActiveView,
    siteSettings,
  } = useShop();

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 2000000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - (cartTotals.finalTotal - cartTotals.shippingFee));
  const freeShippingProgress = Math.min(100, Math.round(((FREE_SHIPPING_THRESHOLD - remainingForFreeShipping) / FREE_SHIPPING_THRESHOLD) * 100));

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setActiveView('checkout');
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden" dir="rtl">
      {/* پس‌زمینه نیمه‌شفاف */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* هدر کشو */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">سبد خرید شما</h3>
                <p className="text-xs text-slate-500">
                  {cartTotals.totalQuantity > 0
                    ? `${toPersianDigits(cartTotals.totalQuantity)} کالا در سبد شما موجود است`
                    : 'سبد خرید شما خالی است'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
              aria-label="بستن سبد خرید"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* نوار ترغیب به ارسال رایگان */}
          {cart.length > 0 && (
            <div className="bg-blue-50/90 px-4 py-2.5 border-b border-blue-100">
              <div className="flex items-center justify-between text-xs font-medium text-blue-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  {remainingForFreeShipping === 0
                    ? 'تبریک! ارسال سفارش شما رایگان شد.'
                    : `فقط ${formatPrice(remainingForFreeShipping)} تا ارسال رایگان سراسری`}
                </span>
                <span className="font-bold">{toPersianDigits(freeShippingProgress)}٪</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* محتوای آیتم‌های سبد */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">سبد خرید شما در حال حاضر خالی است</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                  روغن‌ها و فیلترهای مناسب خودروی خود را انتخاب کنید یا از پک‌های اقتصادی تخفیف‌دار استفاده نمایید.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
                >
                  مشاهده کاتالوگ محصولات
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = getItemUnitPrice(item);
                const itemTotal = unitPrice * item.quantity;
                const isPack = item.purchaseMode === 'pack';

                return (
                  <div key={`${item.product.id}-${item.purchaseMode}`} className="pt-3.5 first:pt-0 flex gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 p-1 flex-shrink-0 flex items-center justify-center">
                      <ProductImage
                        src={item.product.image}
                        packImages={item.product.packImages}
                        alt={item.product.title}
                        category={item.product.category}
                        title={item.product.title}
                        brand={item.product.brand}
                        viscosity={item.product.technicalSpecs?.viscosity}
                        className="w-full h-full object-contain"
                        compact
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.purchaseMode)}
                            className="text-slate-400 hover:text-red-500 p-1 transition"
                            title="حذف از سبد"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* برچسب حالت خرید (تکی یا پکی) */}
                        <div className="mt-1 flex items-center gap-1.5">
                          {isPack ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300">
                              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                              خرید به صورت پک کامل
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                              خرید تکی کالا
                            </span>
                          )}
                        </div>
                      </div>

                      {/* قیمت و دکمه‌های تعداد */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.purchaseMode, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 text-slate-700 rounded-r-lg transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900">
                            {toPersianDigits(item.quantity)}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.purchaseMode, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 text-slate-700 rounded-l-lg transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-left">
                          <div className="text-xs font-bold text-blue-700">
                            {formatPrice(itemTotal)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-slate-400">
                              هر عدد: {formatPrice(unitPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* فوتر کشو - خلاصه فاکتور و دکمه پرداخت */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>قیمت کل کالاها:</span>
                  <span className="font-medium">{formatPrice(cartTotals.subtotal)}</span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>تخفیف نوین فیلتر:</span>
                    <span>- {formatPrice(cartTotals.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    هزینه ارسال ({siteSettings.deliveryTimeEstimate}):
                  </span>
                  <span className="font-medium">
                    {cartTotals.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        رایگان
                      </span>
                    ) : (
                      formatPrice(cartTotals.shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                  <span className="text-sm font-bold">مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-base font-extrabold text-blue-700">
                    {formatPrice(cartTotals.finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>ادامه و ثبت نهایی سفارش</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>پرداخت امن کارت به کارت با ارسال فوری فیش</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

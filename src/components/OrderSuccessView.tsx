import React from 'react';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Printer,
  ArrowRight,
  PhoneCall,
  Send,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPrice, toPersianDigits } from '../utils/shopUtils';

export const OrderSuccessView: React.FC = () => {
  const { lastCompletedOrder, setActiveView, siteSettings } = useShop();

  if (!lastCompletedOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-lg font-bold text-slate-800 mb-4">سفارشی یافت نشد</h2>
        <button
          onClick={() => setActiveView('shop')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl print:shadow-none print:border-none">
        {/* هدر موفقیت */}
        <div className="text-center pb-8 border-b border-slate-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            سفارش شما با موفقیت در نوین فیلتر ثبت شد!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            اطلاعات سفارش و شماره پیگیری برای کارشناسان ارسال شد و پس از بررسی واریزی، روند بسته‌بندی و ارسال آغاز خواهد شد.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 font-bold text-sm">
            <span>شماره پیگیری سفارش شما:</span>
            <span className="font-mono text-base text-blue-700 font-black" dir="ltr">
              {lastCompletedOrder.orderNumber}
            </span>
          </div>
        </div>

        {/* اطلاعیه تحویل کالا */}
        <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-amber-600" />
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                زمان تقریبی تحویل بسته پستی:
              </h4>
              <p className="text-xs text-amber-900">
                {lastCompletedOrder.deliveryEstimate} (سراسر کشور)
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600">
            تاریخ ثبت: <span className="font-medium text-slate-900">{lastCompletedOrder.date}</span>
          </div>
        </div>

        {/* مشخصات گیرنده و پرداخت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 pb-1 border-b border-slate-200">
              مشخصات تحویل گیرنده:
            </h4>
            <p>
              <span className="text-slate-500">نام خریدار:</span> {lastCompletedOrder.customer.fullName}
            </p>
            <p>
              <span className="text-slate-500">تلفن تماس:</span>{' '}
              <span className="font-mono">{lastCompletedOrder.customer.phone}</span>
            </p>
            <p className="leading-relaxed">
              <span className="text-slate-500">آدرس:</span> {lastCompletedOrder.customer.province} -{' '}
              {lastCompletedOrder.customer.city}، {lastCompletedOrder.customer.address}
            </p>
            <p>
              <span className="text-slate-500">کد پستی:</span>{' '}
              <span className="font-mono">{lastCompletedOrder.customer.postalCode}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 pb-1 border-b border-slate-200">
              اطلاعات پرداخت:
            </h4>
            <p>
              <span className="text-slate-500">روش پرداخت:</span> کارت به کارت
            </p>
            <p>
              <span className="text-slate-500">شماره پیگیری واریز:</span>{' '}
              <span className="font-mono font-bold text-blue-700">
                {lastCompletedOrder.payment.trackingNumber}
              </span>
            </p>
            <p>
              <span className="text-slate-500">وضعیت سفارش:</span>{' '}
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                در انتظار تایید پرداخت
              </span>
            </p>
            <p className="text-sm font-bold text-slate-900 pt-1">
              <span className="text-slate-500 font-normal">مبلغ واریزی:</span>{' '}
              {formatPrice(lastCompletedOrder.finalAmount)}
            </p>
          </div>
        </div>

        {/* لیست اقلام فاکتور */}
        <div className="my-6">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
            اقلام خریداری شده:
          </h4>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            {lastCompletedOrder.items.map((item, idx) => (
              <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{item.title}</h5>
                    <span className="text-[11px] text-slate-500">
                      حالت: {item.purchaseMode === 'pack' ? 'پک کامل تعویض روغنی' : 'تک محصول'}
                    </span>
                  </div>
                </div>
                <div className="text-left font-bold text-slate-900">
                  {toPersianDigits(item.quantity)} عدد
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* دکمه‌های اقدام نهایی */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={() => setActiveView('shop')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی فروشگاه</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ فاکتور</span>
            </button>

            <a
              href={`https://t.me/${siteSettings.telegramId.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>ارسال فیش در تلگرام</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

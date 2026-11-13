import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  UploadCloud,
  AlertCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  Phone,
  Send,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  formatPrice,
  toEnglishDigits,
  toPersianDigits,
  validateIranianPhone,
  validatePostalCode,
} from '../utils/shopUtils';
import { BuyerInfo } from '../types';

const IRAN_PROVINCES = [
  'تهران',
  'البرز',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'آذربایجان غربی',
  'خوزستان',
  'مازندران',
  'گیلان',
  'کرمان',
  'یزد',
  'قم',
  'مرکزی',
  'قزوین',
  'همدان',
  'کرمانشاه',
  'کردستان',
  'لرستان',
  'بوشهر',
  'هرمزگان',
  'زنجان',
  'سمنان',
  'گلستان',
  'اردبیل',
  'ایلام',
  'کهگیلویه و بویراحمد',
  'چهارمحال و بختیاری',
  'خراسان جنوبی',
  'خراسان شمالی',
  'سیستان و بلوچستان',
];

export const CheckoutView: React.FC = () => {
  const { cart, cartTotals, siteSettings, submitOrder, setActiveView } = useShop();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // پرداخت
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedSheba, setCopiedSheba] = useState(false);

  // وضعیت خطا و لودینگ
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-lg font-bold text-slate-800 mb-2">سبد خرید شما برای تسویه حساب خالی است</h2>
        <p className="text-xs text-slate-500 mb-6">
          لطفاً ابتدا کالاهای مورد نظر خود را به سبد خرید اضافه کنید.
        </p>
        <button
          onClick={() => setActiveView('shop')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          مشاهده کاتالوگ فروشگاه
        </button>
      </div>
    );
  }

  const handleCopy = (text: string, type: 'card' | 'sheba') => {
    navigator.clipboard?.writeText(toEnglishDigits(text).replace(/\s/g, ''));
    if (type === 'card') {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } else {
      setCopiedSheba(true);
      setTimeout(() => setCopiedSheba(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حداکثر حجم تصویر فیش باید کمتر از ۵ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'نام و نام خانوادگی الزامی است';
    }

    const phoneValidation = validateIranianPhone(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message || 'شماره تلفن همراه معتبر نیست';
    }

    if (!province) {
      errors.province = 'انتخاب استان الزامی است';
    }

    if (!city.trim()) {
      errors.city = 'نام شهر الزامی است';
    }

    if (!address.trim() || address.length < 10) {
      errors.address = 'آدرس پستی دقیق با پلاک و واحد الزامی است';
    }

    const postalValidation = validatePostalCode(postalCode);
    if (!postalValidation.isValid) {
      errors.postalCode = postalValidation.message || 'کد پستی ۱۰ رقمی معتبر نیست';
    }

    if (!trackingNumber.trim()) {
      errors.trackingNumber = 'شماره پیگیری واریز کارت به کارت الزامی است';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const buyer: BuyerInfo = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      city: city.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await submitOrder(buyer, {
        trackingNumber: trackingNumber.trim(),
        receiptImage: receiptImage || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      {/* دکمه بازگشت */}
      <button
        onClick={() => setActiveView('shop')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-5 sm:mb-6 bg-white px-3.5 py-2 rounded-xl border border-slate-200"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت و اصلاح سبد خرید</span>
      </button>

      {/* اطلاعیه تحویل سفارش */}
      <div className="bg-amber-50 border-r-4 border-amber-500 p-3.5 sm:p-4 rounded-xl mb-6 sm:mb-8 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400 text-slate-950 rounded-xl flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-950">
              اطلاعیه زمان‌بندی ارسال نوین فیلتر
            </h3>
            <p className="text-xs text-amber-900 mt-0.5">
              مدت زمان ارسال کلیه سفارش‌ها به سراسر کشور: <span className="font-bold underline">{siteSettings.deliveryTimeEstimate}</span> پس از تایید واریزی
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-900 font-semibold bg-white/60 px-3 py-1.5 rounded-lg border border-amber-200">
          <Truck className="w-4 h-4 text-amber-600" />
          <span>بسته‌بندی ضربه‌گیر ویژه روغن موتور</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* فرم اطلاعات گیرنده و روش پرداخت */}
          <div className="lg:col-span-8 space-y-6">
            {/* بخش ۱: اطلاعات پستی خریدار */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                  ۱
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  اطلاعات پستی و تحویل‌گیرنده سفارش
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* نام و نام خانوادگی */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نام و نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثلاً: علی حسینی"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none ${
                      formErrors.fullName ? 'border-red-400 bg-red-50/50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.fullName && (
                    <span className="text-[11px] text-red-600 mt-1 block">{formErrors.fullName}</span>
                  )}
                </div>

                {/* شماره تلفن همراه */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شماره تلفن همراه معتبر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-mono text-left ${
                      formErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-red-600 mt-1 block">{formErrors.phone}</span>
                  )}
                </div>

                {/* استان */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    استان مقصد <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    {IRAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* شهر */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شهر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="نام شهر خود را وارد کنید"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none ${
                      formErrors.city ? 'border-red-400 bg-red-50/50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.city && (
                    <span className="text-[11px] text-red-600 mt-1 block">{formErrors.city}</span>
                  )}
                </div>

                {/* کد پستی */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    کد پستی ۱۰ رقمی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                    dir="ltr"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-mono text-left ${
                      formErrors.postalCode ? 'border-red-400 bg-red-50/50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.postalCode && (
                    <span className="text-[11px] text-red-600 mt-1 block">{formErrors.postalCode}</span>
                  )}
                </div>

                {/* ایمیل (اختیاری) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آدرس ایمیل (اختیاری)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 text-left font-mono"
                  />
                </div>

                {/* آدرس دقیق پستی */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آدرس دقیق پستی (خیابان، کوچه، پلاک، زنگ یا واحد) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="آدرس دقیق را بنویسید..."
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none ${
                      formErrors.address ? 'border-red-400 bg-red-50/50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.address && (
                    <span className="text-[11px] text-red-600 mt-1 block">{formErrors.address}</span>
                  )}
                </div>

                {/* یادداشت ارسال */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    توضیحات و یادداشت ارسال (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="توضیحاتی برای مامور پست یا نوع بسته‌بندی..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* بخش ۲: پرداخت کارت به کارت */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ۲
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  روش پرداخت: کارت به کارت مستقیم به نام نوین فیلتر
                </h2>
              </div>

              {/* کارت بانکی شکیل */}
              <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-md border border-blue-800/40 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[11px] text-amber-300 font-semibold">
                      {siteSettings.bankInfo.bankName}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      دارنده حساب: {siteSettings.bankInfo.accountHolder}
                    </h4>
                  </div>
                  <CreditCard className="w-8 h-8 text-amber-400" />
                </div>

                <div className="my-4">
                  <div className="text-[11px] text-slate-300 mb-1">شماره کارت جهت واریز:</div>
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-sm sm:text-lg font-mono font-bold tracking-wider text-amber-300" dir="ltr">
                      {siteSettings.bankInfo.cardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(siteSettings.bankInfo.cardNumber, 'card')}
                      className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedCard ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی شماره</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-300 mb-1">شماره شبا (IBAN):</div>
                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-xs text-slate-300 font-mono" dir="ltr">
                    <span className="truncate mr-2">{siteSettings.bankInfo.shebaNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(siteSettings.bankInfo.shebaNumber, 'sheba')}
                      className="text-amber-300 hover:text-white flex-shrink-0"
                    >
                      {copiedSheba ? 'کپی شد' : 'کپی شبا'}
                    </button>
                  </div>
                </div>
              </div>

              {/* فرم ثبت شماره پیگیری و آپلود فیش */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شماره پیگیری / کد رهگیری واریز <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="کد پیگیری چند رقمی بانک را وارد کنید"
                    dir="ltr"
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-mono text-left ${
                      formErrors.trackingNumber
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {formErrors.trackingNumber && (
                    <span className="text-[11px] text-red-600 mt-1 block">
                      {formErrors.trackingNumber}
                    </span>
                  )}
                </div>

                {/* آپلود فیش بانکی */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    تصویر رسید / فیش واریزی (پیشنهادی)
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition">
                    <UploadCloud className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">
                      {receiptImage ? 'تغییر تصویر فیش' : 'انتخاب فایل فیش'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* پیش‌نمایش تصویر رسید */}
                {receiptImage && (
                  <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={receiptImage}
                        alt="پیش‌نمایش فیش"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-300"
                      />
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        فیش واریزی با موفقیت بارگذاری شد
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptImage('')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      حذف فیش
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* سایدبار خلاصه فاکتور و ثبت نهایی */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs sticky top-24 space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>فاکتور خرید شما ({toPersianDigits(cartTotals.totalQuantity)} قلم)</span>
              </h3>

              {/* لیست خلاصه اقلام */}
              <div className="max-h-56 overflow-y-auto space-y-2.5 divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.purchaseMode}`} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{item.product.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {toPersianDigits(item.quantity)} عدد × {item.purchaseMode === 'pack' ? 'پک کامل' : 'تکی'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ریز مبالغ فاکتور */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>مجموع قیمت کالاها:</span>
                  <span className="font-medium">{formatPrice(cartTotals.subtotal)}</span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>مجموع تخفیف نوین فیلتر:</span>
                    <span>- {formatPrice(cartTotals.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>هزینه بسته‌بندی و ارسال:</span>
                  <span className="font-medium">
                    {cartTotals.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">رایگان</span>
                    ) : (
                      formatPrice(cartTotals.shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                  <span className="text-sm font-bold">مبلغ نهایی فاکتور:</span>
                  <span className="text-lg font-black text-blue-700">
                    {formatPrice(cartTotals.finalTotal)}
                  </span>
                </div>
              </div>

              {/* دکمه ثبت نهایی */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>در حال ثبت سفارش...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ثبت نهایی سفارش و ارسال فاکتور</span>
                  </>
                )}
              </button>

              <div className="space-y-1.5 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تضمین سلامت فیزیکی قطعات تا زمان تحویل</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>پشتیبانی سفارشات: {siteSettings.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

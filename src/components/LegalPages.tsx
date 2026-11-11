import React from 'react';
import {
  ShieldAlert,
  Truck,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const LegalPages: React.FC<{
  type: 'terms' | 'shipping' | 'faq';
}> = ({ type }) => {
  const { setActiveView, siteSettings } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => setActiveView('shop')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 bg-white px-3.5 py-2 rounded-xl border border-slate-200"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به صفحه اصلی فروشگاه</span>
      </button>

      {type === 'terms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                قوانین، مقررات و رویه مرجوعی کالا در نوین فیلتر
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                شفافیت کامل در فرآیند خرید، اصالت قطعات و حفظ حقوق مصرف‌کننده
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>۱. شرایط مرجوعی کالاهای پلمپ‌نشده و خودرویی:</span>
            </h2>
            <p>
              با توجه به ماهیت فنی و شیمیایی روانکارهای خودرو (روغن موتور، واسکازین) و حساسیت فیلتراسیون، به منظور حفظ ایمنی پیشرانه خودروها، مرجوعی کالا تا ۷ روز پس از دریافت، منوط به عدم باز شدن پلمپ فیزیکی قوطی روغن، سالم ماندن بسته‌بندی هولوگرام‌دار و عدم استفاده از فیلترها می‌باشد.
            </p>
            <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
              <strong>نکته مهم:</strong> هرگونه باز شدن درب ظرف روغن، مخدوش شدن بارکد اصالت یا باز شدن بسته‌بندی نایلونی وکیوم فیلترهای هوا و روغن، کالا را از شمول ضمانت مرجوعی سلیقه‌ای خارج می‌سازد.
            </p>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 pt-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>۲. ضمانت ۱۰۰٪ اصالت و مطابقت آزمایشگاهی:</span>
            </h2>
            <p>
              نوین فیلتر اصالت تمامی روغن‌ها و فیلترهای ارائه‌شده را به صورت ۱۰۰٪ تضمین می‌کند. در صورتی که هرگونه مغایرت فنی در گرانروی یا عدم اصالت احراز گردد، بدون هیچ قید و شرطی کل وجه به خریدار مسترد خواهد شد.
            </p>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 pt-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>۳. نحوه ثبت درخواست استرداد:</span>
            </h2>
            <p>
              جهت هماهنگی مرجوعی با شماره پشتیبانی <span className="font-mono font-bold">{siteSettings.phone}</span> یا آیدی تلگرام <span className="font-mono font-bold">{siteSettings.telegramId}</span> تماس حاصل نمایید.
            </p>
          </div>
        </div>
      )}

      {type === 'shipping' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                رویه و شرایط ارسال سفارش‌ها در نوین فیلتر
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ارسال ایمن و تخصصی به تمامی استان‌ها و شهرهای کشور
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <h3 className="font-bold text-blue-950 text-sm mb-1">
                مدت زمان استاندارد ارسال:
              </h3>
              <p className="text-blue-900 text-xs">
                تمامی سفارش‌های ثبت‌شده پس از تایید فیش واریزی در نوین فیلتر، طی <span className="font-extrabold underline">{siteSettings.deliveryTimeEstimate}</span> بسته‌بندی، تحویل پست پیشتاز یا تیپاکس شده و کد رهگیری پستی به شماره همراه خریدار پیامک می‌شود.
              </p>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              بسته‌بندی ضربه‌گیر ویژه کالاهای روغنی
            </h2>
            <p>
              با توجه به حساسیت ظروف روغن در زمان جابجایی پست، کلیه سفارش‌ها درون کارتن‌های ۵ لایه ضدضربه به همراه نایلون‌های حباب‌دار صنعتی محکم وکیوم می‌شوند تا از هرگونه نشتی، ضربه یا تغییر شکل جلوگیری به عمل آید.
            </p>

            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              هزینه ارسال و شرایط ارسال رایگان
            </h2>
            <p>
              برای تمامی سبدهای خرید با ارزش بیش از ۲,۰۰۰,۰۰۰ تومان، هزینه بسته‌بندی و ارسال به کلیه نقاط ایران کاملاً رایگان خواهد بود. برای مبالغ کمتر، هزینه ثابت ۷۵,۰۰۰ تومان محاسبه می‌گردد.
            </p>
          </div>
        </div>
      )}

      {type === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 bg-sky-100 text-sky-800 rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                پرسش‌های متداول و راهنمای تخصصی
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                پاسخ به سوالات متداول درباره انتخاب گرانروی روغن، زمان تعویض و پک‌ها
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                چرا خرید «پک‌های سرویس اقتصادی» بهتر از خرید تکی است؟
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                در پک‌های اقتصادی، فیلتر روغن و فیلتر هوای استاندارد متناسب با موتور خودرو همراه با روغن اصلی ست شده و علاوه بر تخفیف تکی، ۱۰ الی ۱۵ درصد تخفیف پکی دریافت می‌کنید و تمام قطعات تعویض روغنی را یکجا دریافت می‌نمایید.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                برای موتور TU5 (پژو ۲۰۶، ۲۰۷، رانا، پارس TU5) چه روغنی مناسب است؟
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                بهترین گرانروی توصیه شده کارخانه روغن ۱۰W-40 نیمه سنتتیک یا تمام سنتتیک با سطح کیفیت API SL/SM/SN مانند بهران رانا یا کاسترول مگناتک می‌باشد.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                روغن مناسب موتورهای توربوشارژ (دنا پلاس توربو، تارا، شاهین) چیست؟
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                برای این خودروها به دلیل حرارت بالای توربین، استفاده از روغن‌های تمام سینتتیک 5W-30 یا 5W-40 با استاندارد ویژه SN PLUS یا SP (مانند بهران سوپر رانا) ضروری است تا مانع کربن گرفتگی شفت توربو شود.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                آیا پس از واریز کارت به کارت فاکتور رسمی صادر می‌شود؟
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                بله، پس از ثبت شماره پیگیری و ارسال فیش، فاکتور معتبر با شماره پیگیری یکتا در سایت صادر شده و یک نسخه چاپی نیز همراه با کارتن به آدرس شما فرستاده می‌شود.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

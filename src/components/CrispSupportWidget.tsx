import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Headphones,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { validateIranianPhone } from '../utils/shopUtils';

export const CrispSupportWidget: React.FC = () => {
  const { siteSettings, currentUser } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('روغن مناسب خودرو');
  const [initialMessage, setInitialMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // پیام‌های شبیه‌سازی مکالمه زنده
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'agent'; text: string; time: string }[]
  >([]);
  const [currentReply, setCurrentReply] = useState('');

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('نام و نام خانوادگی خود را وارد کنید');
      return;
    }

    const phoneValidation = validateIranianPhone(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'شماره تلفن همراه معتبر نیست');
      return;
    }

    setError(null);
    setIsConnected(true);

    const now = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // Official Crisp integration hook if crisp script is loaded:
    if (typeof window !== 'undefined' && (window as any).$crisp) {
      try {
        (window as any).$crisp.push(['set', 'user:nickname', [name]]);
        (window as any).$crisp.push(['set', 'user:phone', [phone]]);
        if (email) (window as any).$crisp.push(['set', 'user:email', [email]]);
        (window as any).$crisp.push(['do', 'chat:open']);
      } catch (err) {
        console.warn('Crisp API call:', err);
      }
    }

    // Initialize messages
    setChatMessages([
      {
        sender: 'agent',
        text: `سلام ${name} عزیز! به پشتیبانی فنی تخصصی نوین فیلتر خوش آمدید. کارشناس فنی پیشرانه خودرو در خدمت شماست. سوال شما درباره «${inquiryType}» چیست؟`,
        time: now,
      },
    ]);

    if (initialMessage.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: initialMessage.trim(),
          time: now,
        },
      ]);
      setInitialMessage('');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReply.trim()) return;

    const now = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsg = currentReply.trim();
    setCurrentReply('');

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        time: now,
      },
    ]);

    // Simulated instant reply from technical expert
    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `پیام شما ثبت شد. کارشناسان نوین فیلتر در سریع‌ترین زمان از طریق همین چت یا شماره همراه ${phone} پاسخگوی شما خواهند بود. در صورت تمایل می‌توانید مستقیماً با تلفن ${siteSettings.phone} نیز تماس حاصل فرمایید.`,
          time: now2,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden" dir="rtl">
      {/* دکمه شناور چت */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-full shadow-xl hover:shadow-2xl transition transform hover:scale-105 active:scale-95 group"
          aria-label="پشتیبانی آنلاین"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-white" />
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold">پشتیبانی نوین فیلتر</div>
            <div className="text-[10px] text-blue-100 font-medium">مشاوره تخصصی آنلاین</div>
          </div>
        </button>
      )}

      {/* پنجره چت و پیش‌پشتیبانی کریسپ */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* هدر پنجره */}
          <div className="p-4 bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Headphones className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">پشتیبانی فنی نوین فیلتر</h4>
                <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  پاسخگویی آنلاین کارشناسان
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوا: فرم قبل از چت یا پنجره گفتگو */}
          {!isConnected ? (
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="text-center mb-4">
                <h5 className="text-xs font-bold text-slate-800">
                  برای اتصال به کارشناس، لطفاً اطلاعات زیر را تکمیل فرمایید:
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  جهت پیگیری سریع و ارسال پاسخ به پیامک شما
                </p>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartChat} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    نام و نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً: علی مرادی"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    شماره تلفن همراه <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    آدرس ایمیل (اختیاری)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    dir="ltr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    موضوع مشاوره
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="روغن مناسب خودرو">مشاوره انتخاب روغن و فیلتر خودرو</option>
                    <option value="پیگیری سفارش">پیگیری وضعیت سفارش و ارسال فیش</option>
                    <option value="پک اقتصادی">مشاوره درباره پک‌های سرویس دوره‌ای</option>
                    <option value="همکاری و عمده">خرید عمده و همکاری تجاری</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    پرسش اولیه شما (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder="مدل خودرو و سوال خود را بنویسید..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  شروع گفتگوی آنلاین
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50">
              {/* پیام‌های چت */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* فیلد ارسال پیام جدید */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={currentReply}
                  onChange={(e) => setCurrentReply(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

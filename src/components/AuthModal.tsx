import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  RotateCcw,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { toEnglishDigits, toPersianDigits, validateIranianPhone } from '../utils/shopUtils';
import { resolveAssetUrl } from '../utils/assetHelper';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, requestOtp, verifyOtp } = useShop();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [latestSentCode, setLatestSentCode] = useState<string>('');

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateIranianPhone(phone);
    if (!validation.isValid) {
      setError(validation.message || 'شماره تلفن همراه معتبر نیست');
      return;
    }

    // تولید و ثبت کد پیامکی واقعی در پایگاه‌داده و پنل ادمین
    const result = requestOtp(validation.cleanPhone || phone);
    setLatestSentCode(result.code);
    setError(null);
    setTimer(120);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = toEnglishDigits(otpCode).trim();
    if (!cleanInput || cleanInput.length < 5) {
      setError('لطفاً کد تایید ۵ رقمی را کامل وارد نمایید');
      return;
    }

    const verification = verifyOtp(phone, cleanInput, fullName);
    if (!verification.success) {
      setError(verification.message || 'کد تایید اشتباه است.');
      return;
    }

    // ورود موفقیت‌آمیز
    setIsAuthModalOpen(false);
    setStep('phone');
    setPhone('');
    setOtpCode('');
    setError(null);
  };

  const handleResend = () => {
    if (timer > 0) return;
    const result = requestOtp(phone);
    setLatestSentCode(result.code);
    setTimer(120);
    setError(null);
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError(null);
    setStep('phone');
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianDigits(mins)}:${secs < 10 ? '۰' : ''}${toPersianDigits(secs)}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl z-10 border border-slate-200">
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <img
              src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
              alt="نوین فیلتر"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            ورود به حساب کاربری نوین فیلتر
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'phone'
              ? 'شماره موبایل خود را وارد نمایید تا کد تایید برای شما ارسال شود'
              : `کد پیامکی ارسال شده به شماره ${phone} را وارد کنید`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام و نام خانوادگی (اختیاری)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثلاً: علی رضایی"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شماره تلفن همراه <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-left"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              ارسال پیامک کد تایید (SMS)
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* اعلان وضعیت ارسال پیامک */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>پیامک کد ورود ارسال شد</span>
              </div>
              <p className="text-[11px] text-blue-800">
                کد ارسالی در سرور و تب «لاگ پیامک‌ها» در پنل مدیریت نوین فیلتر ثبت شد.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                کد ۵ رقمی تایید را وارد کنید:
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="-----"
                maxLength={5}
                dir="ltr"
                autoFocus
                className="w-full py-3 text-center text-xl tracking-[0.5em] font-mono font-black bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* شمارش معکوس و ارسال مجدد */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="hover:text-slate-800 underline"
              >
                تغییر شماره همراه
              </button>

              {timer > 0 ? (
                <div className="flex items-center gap-1 font-mono text-slate-600 font-bold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatCountdown(timer)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ارسال مجدد پیامک</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              تایید کد و ورود
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>امنیت ورود تضمین‌شده با سامانه پیامکی نوین فیلتر</span>
        </div>
      </div>
    </div>
  );
};

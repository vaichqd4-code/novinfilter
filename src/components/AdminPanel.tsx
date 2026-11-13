import React, { useState } from 'react';
import {
  Package,
  Image,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Search,
  ExternalLink,
  Save,
  RotateCcw,
  Eye,
  X,
  CreditCard,
  Phone,
  Sparkles,
  Lock,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Send,
  LogOut,
  Radio,
  Upload,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Banner, Order, Product, ProductCategory } from '../types';
import {
  formatPrice,
  getCategoryTitle,
  toPersianDigits,
} from '../utils/shopUtils';
import { ProductImage } from './ProductImage';
import { resolveAssetUrl } from '../utils/assetHelper';

export const AdminPanel: React.FC = () => {
  const {
    products,
    orders,
    banners,
    siteSettings,
    otpLogs,
    clearOtpLogs,
    setActiveView,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateBanners,
    updateSiteSettings,
    resetAllDataToDefaults,
    isAdminAuthenticated,
    verifyAdminPassword,
    adminLogout,
  } = useShop();

  // وضعیت لاگین ادمین
  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);

  // تب فعال در پنل
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'orders' | 'sms' | 'settings'>('products');

  // جستجو در تب‌ها
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | 'all'>('all');

  // مودال افزودن/ویرایش محصول
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // پیش‌نمایش تصویر فیش سفارش
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // فرم تنظیمات
  const [tempSettings, setTempSettings] = useState({ ...siteSettings });
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);

  // مودال بنر جدید/ویرایش
  const [tempBanners, setTempBanners] = useState<Banner[]>([...banners]);
  const [bannersSavedFeedback, setBannersSavedFeedback] = useState(false);

  // تابع فشرده‌سازی و بارگذاری تصویر از گوشی یا سیستم ادمین
  const handleImageFileUpload = (file: File, onDone: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          onDone(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // اگر ادمین احراز هویت نشده باشد، فرم ورود رمز مدیریت نمایش داده می‌شود
  if (!isAdminAuthenticated) {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const isValid = verifyAdminPassword(adminInputPassword);
      if (isValid) {
        setAdminPasswordError(null);
      } else {
        setAdminPasswordError('رمز عبور مدیریت اشتباه است. (رمز پیش‌فرض: novin1405)');
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <img
                src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
                alt="نوین فیلتر"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              ورود امن به پنل مدیریت نوین فیلتر
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              این بخش صرفاً برای مدیریت فروشگاه است. لطفاً رمز عبور خود را وارد کنید:
            </p>
          </div>

          {adminPasswordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{adminPasswordError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                رمز عبور مدیریت
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminInputPassword}
                  onChange={(e) => setAdminInputPassword(e.target.value)}
                  placeholder="رمز مدیریت را وارد کنید..."
                  dir="ltr"
                  autoFocus
                  required
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-center tracking-widest"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                رمز عبور پیش‌فرض: <code className="font-mono text-blue-700 font-bold">novin1405</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              ورود به پنل
            </button>

            <button
              type="button"
              onClick={() => setActiveView('shop')}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              ← انصراف و بازگشت به فروشگاه
            </button>
          </form>
        </div>
      </div>
    );
  }

  // فیلتر کردن محصولات برای جدول
  const filteredAdminProducts = products.filter((p) => {
    if (selectedProductCategory !== 'all' && p.category !== selectedProductCategory) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.compatibleCars.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: '',
      title: '',
      category: 'engine_oil',
      brand: 'نوین فیلتر',
      price: 500000,
      discountPercent: 10,
      stock: 20,
      rating: 5,
      reviewsCount: 1,
      image: '',
      gallery: [],
      compatibleCars: ['پژو ۲۰۶', 'پژو ۲۰۷', 'دنا'],
      description: 'توضیحات فنی کامل محصول و مشخصات روانکاری...',
      technicalSpecs: {
        viscosity: '10W-40',
        apiStandard: 'API SN',
        volume: '۴ لیتر',
      },
      tags: ['ویژه'],
      isServicePack: false,
      isAvailable: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      const { id, rating, reviewsCount, ...rest } = editingProduct;
      addProduct(rest);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(tempSettings);
    setSettingsSavedFeedback(true);
    setTimeout(() => setSettingsSavedFeedback(false), 2500);
  };

  const handleSaveBanners = () => {
    updateBanners(tempBanners);
    setBannersSavedFeedback(true);
    setTimeout(() => setBannersSavedFeedback(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 py-8 px-4 sm:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* نوار بالایی هدر ادمین */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-amber-400 p-0.5 shadow-md flex-shrink-0">
              <img
                src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
                alt="نوین فیلتر"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  پنل مدیریت اختصاصی نوین فیلتر
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  احراز هویت شده (مدیر سایت)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                مدیریت محصولات، سفارش‌ها، پیامک‌های کد ورود، بنرها و تنظیمات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('shop')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>مشاهده سایت</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl text-xs font-bold transition border border-slate-200"
              title="خروج از حساب مدیریت"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* منوی تب‌های ادمین */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>مدیریت محصولات ({toPersianDigits(products.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سفارش‌ها ({toPersianDigits(orders.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'sms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>لاگ پیامک‌ها و کدهای ورود ({toPersianDigits(otpLogs.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'banners'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>مدیریت بنرها</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>تنظیمات و رمز پنل</span>
          </button>
        </div>

        {/* ۱. مدیریت محصولات */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="جستجوی عنوان یا برند..."
                    className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={selectedProductCategory}
                  onChange={(e) => setSelectedProductCategory(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                >
                  <option value="all">همه دسته‌ها</option>
                  <option value="service_pack">پک‌های سرویس اقتصادی</option>
                  <option value="engine_oil">روغن موتور</option>
                  <option value="oil_filter">فیلتر روغن</option>
                  <option value="air_filter">فیلتر هوا</option>
                  <option value="cabin_filter">فیلتر اتاق</option>
                  <option value="gearbox_oil">روغن گیربکس</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن محصول جدید</span>
              </button>
            </div>

            {/* جدول محصولات */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">تصویر</th>
                    <th className="p-3.5">عنوان محصول</th>
                    <th className="p-3.5">دسته‌بندی</th>
                    <th className="p-3.5">قیمت عادی</th>
                    <th className="p-3.5">تخفیف</th>
                    <th className="p-3.5">موجودی</th>
                    <th className="p-3.5">نوع عرضه</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 w-16">
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1">
                          <ProductImage
                            src={p.image}
                            packImages={p.packImages}
                            alt=""
                            category={p.category}
                            title={p.title}
                            brand={p.brand}
                            viscosity={p.technicalSpecs?.viscosity}
                            className="w-full h-full object-contain"
                            compact
                          />
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs">
                        <div className="line-clamp-2">{p.title}</div>
                        <span className="text-[10px] text-blue-600 font-normal">برند: {p.brand}</span>
                      </td>
                      <td className="p-3 text-slate-600">{getCategoryTitle(p.category)}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{formatPrice(p.price)}</td>
                      <td className="p-3">
                        {p.discountPercent > 0 ? (
                          <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            {toPersianDigits(p.discountPercent)}٪
                          </span>
                        ) : (
                          <span className="text-slate-400">ندارد</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => updateProduct(p.id, { isAvailable: !p.isAvailable })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            p.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.isAvailable ? `موجود (${toPersianDigits(p.stock)})` : 'ناموجود'}
                        </button>
                      </td>
                      <td className="p-3">
                        {p.isServicePack ? (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                            پک کامل
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                            تکی
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="ویرایش محصول"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف محصول «${p.title}» اطمینان دارید؟`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف محصول"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ۲. لاگ پیامک‌های ارسالی و کدهای ورود (جدید و درخواستی) */}
        {activeTab === 'sms' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>لاگ پیامک‌های ارسالی و کدهای ورود کاربران</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  مشاهده کدهای تایید ارسال شده به شماره تلفن همراه خریداران جهت احراز و تایید دستی یا بررسی وضعیت درگاه
                </p>
              </div>

              {otpLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('آیا از پاکسازی تاریخچه پیامک‌ها اطمینان دارید؟')) {
                      clearOtpLogs();
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>پاکسازی لاگ پیامک‌ها</span>
                </button>
              )}
            </div>

            {/* کارت راهنما و اتصال به سامانه پیامکی واقعی */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-blue-950 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>سامانه پیامکی نوین فیلتر فعال است</span>
              </h4>
              <p className="text-blue-900 leading-relaxed">
                هر زمان کاربری در سایت شماره موبایل خود را وارد کند، یک پیامک همراه با کد تایید ۵ رقمی صادر شده و بلادرنگ در جدول زیر برای شما نمایش داده می‌شود. شما می‌توانید کد را مستقیماً از اینجا بخوانید و به خریدار اطلاع دهید یا وضعیت تایید آن را بررسی کنید.
              </p>
            </div>

            {/* جدول تاریخچه کدهای پیامکی */}
            {otpLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                هنوز پیامکی ثبت نشده است. با ورود شماره تلفن در مودال سایت، اولین پیامک ثبت خواهد شد.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">شماره همراه گیرنده</th>
                      <th className="p-3.5 text-center">کد تایید پیامکی (OTP)</th>
                      <th className="p-3.5">زمان ارسال</th>
                      <th className="p-3.5">درگاه پیامک</th>
                      <th className="p-3.5 text-center">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {otpLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-900" dir="ltr">
                          {log.phone}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-mono text-base font-black px-3 py-1 bg-amber-100 text-amber-950 rounded-xl border border-amber-300 tracking-wider">
                            {log.code}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{log.formattedTime}</td>
                        <td className="p-3.5 text-slate-600">{log.gateway}</td>
                        <td className="p-3.5 text-center">
                          {log.status === 'verified' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تایید و وارد شد</span>
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                              ارسال شده (در انتظار ورود)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ۳. مدیریت سفارش‌ها */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                فهرست کلیه سفارش‌های ثبت شده خریداران ({toPersianDigits(orders.length)})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                تاکنون سفارشی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-blue-700 bg-white px-3 py-1 rounded-xl border border-blue-200">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500">{ord.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-semibold">تغییر وضعیت:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                            ord.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : ord.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="pending">در انتظار بررسی</option>
                          <option value="approved">تایید و آماده بسته‌بندی</option>
                          <option value="shipped">ارسال شده با پست/تیپاکس</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* اطلاعات خریدار */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">مشخصات خریدار:</h4>
                        <p className="text-slate-700">{ord.customer.fullName}</p>
                        <p className="text-blue-700 font-mono font-semibold" dir="ltr">
                          {ord.customer.phone}
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                          {ord.customer.province} - {ord.customer.city}، {ord.customer.address}
                        </p>
                        <p className="text-slate-400">کد پستی: {ord.customer.postalCode}</p>
                      </div>

                      {/* اطلاعات پرداخت */}
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900">اطلاعات واریز:</h4>
                        <p className="text-slate-600">
                          شماره پیگیری کارت‌به‌کارت:
                          <span className="font-mono font-bold text-slate-900 mr-1">
                            {ord.payment.trackingNumber}
                          </span>
                        </p>
                        <p className="font-bold text-slate-900">
                          مبلغ واریزی: {formatPrice(ord.finalAmount)}
                        </p>

                        {ord.payment.receiptImage && (
                          <button
                            onClick={() => setViewingReceipt(ord.payment.receiptImage || '')}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده تصویر فیش واریزی</span>
                          </button>
                        )}
                      </div>

                      {/* اقلام سفارش */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">اقلام خریداری شده:</h4>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                              <span className="truncate max-w-[150px]">{item.title}</span>
                              <span className="font-bold">{toPersianDigits(item.quantity)} عدد</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ۴. مدیریت بنرها */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  مدیریت اسلایدر و بنرهای تبلیغاتی
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تنظیم ابعاد بهینه و تغییر متون و لینک‌های صفحه اصلی
                </p>
              </div>

              <div className="flex items-center gap-2">
                {bannersSavedFeedback && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    تغییرات ذخیره شد
                  </span>
                )}
                <button
                  onClick={handleSaveBanners}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات بنرها</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1">
              <h4 className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>راهنمای سایز و نسبت ابعاد بهینه بنرها:</span>
              </h4>
              <p>
                • <strong>بنر اسلایدر اصلی:</strong> ابعاد پیشنهادی ۱۲۰۰ × ۴۰۰ پیکسل (یا نسبت ۳:۱).
              </p>
              <p>
                • <strong>بنرهای فرعی / ساید:</strong> ابعاد پیشنهادی ۶۰۰ × ۳۰۰ پیکسل (یا نسبت ۲:۱).
              </p>
            </div>

            <div className="space-y-4">
              {tempBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                      بنر شماره {toPersianDigits(index + 1)} ({banner.type === 'slider' ? 'اسلایدر اصلی' : 'کارت تبلیغاتی'})
                    </span>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <span>نمایش در سایت:</span>
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={(e) => {
                          const updated = [...tempBanners];
                          updated[index].isActive = e.target.checked;
                          setTempBanners(updated);
                        }}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        عنوان اصلی بنر
                      </label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => {
                          const updated = [...tempBanners];
                          updated[index].title = e.target.value;
                          setTempBanners(updated);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        زیرعنوان بنر
                      </label>
                      <input
                        type="text"
                        value={banner.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...tempBanners];
                          updated[index].subtitle = e.target.value;
                          setTempBanners(updated);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* بخش آپلود و تنظیم عکس بنر تبلیغاتی */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <label className="block font-bold text-slate-800">
                      تصویر بنر تبلیغاتی (آپلود عکس از گوشی یا رایانه)
                    </label>

                    <div className="flex items-center gap-3">
                      {/* پیش‌نمایش تصویر بنر */}
                      <div className="w-28 h-16 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                        {banner.imageUrl ? (
                          <img
                            src={resolveAssetUrl(banner.imageUrl)}
                            alt="پیش‌نمایش بنر"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">بدون عکس</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود عکس بنر</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileUpload(file, (dataUrl) => {
                                  const updated = [...tempBanners];
                                  updated[index].imageUrl = dataUrl;
                                  setTempBanners(updated);
                                });
                              }
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          value={banner.imageUrl || ''}
                          onChange={(e) => {
                            const updated = [...tempBanners];
                            updated[index].imageUrl = e.target.value;
                            setTempBanners(updated);
                          }}
                          dir="ltr"
                          placeholder="یا آدرس فایل: assets/images/... یا لینک مستقیم عکس"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                        انتخاب سریع از بنرهای آماده نوین فیلتر (با خودروهای ایرانی):
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {[
                          { label: 'بنر اصلی پک‌ها (دنا و ۲۰۶)', path: 'assets/images/banners/hero-packs-showcase.jpg' },
                          { label: 'تعمیرگاه ایران‌خودرو', path: 'assets/images/banners/hero-ikco-workshop.jpg' },
                          { label: 'سرویس سایپا (پراید و شاهین)', path: 'assets/images/banners/hero-saipa-fleet.jpg' },
                          { label: 'کارت تبلیغاتی پژو و TU5', path: 'assets/images/banners/promo-ikco-tu5.jpg' },
                          { label: 'کارت تبلیغاتی اقتصادی سایپا', path: 'assets/images/banners/promo-saipa-eco.jpg' },
                        ].map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => {
                              const updated = [...tempBanners];
                              updated[index].imageUrl = preset.path;
                              setTempBanners(updated);
                            }}
                            className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-0.5">متن برچسب (بج)</label>
                        <input
                          type="text"
                          value={banner.badgeText || ''}
                          onChange={(e) => {
                            const updated = [...tempBanners];
                            updated[index].badgeText = e.target.value;
                            setTempBanners(updated);
                          }}
                          placeholder="مثلاً: پیشنهاد شگفت‌انگیز فصل"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-0.5">لینک مقصد بنر</label>
                        <input
                          type="text"
                          value={banner.linkUrl}
                          onChange={(e) => {
                            const updated = [...tempBanners];
                            updated[index].linkUrl = e.target.value;
                            setTempBanners(updated);
                          }}
                          dir="ltr"
                          placeholder="#packs یا #car-peugeot-206"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۵. تنظیمات عمومی و رمز پنل */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  تنظیمات عمومی، رمز عبور پنل و درگاه پیامک
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تغییر رمز ورود مدیریت، شماره پشتیبانی و تنظیمات پیامک
                </p>
              </div>

              {settingsSavedFeedback && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  تنظیمات با موفقیت ذخیره شد
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* تغییر رمز عبور محافظت شده پنل مدیریت */}
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>رمز عبور اختصاصی پنل مدیریت (جهت مخفی‌سازی کامل):</span>
                </h3>
                <div className="max-w-xs">
                  <input
                    type="text"
                    value={tempSettings.adminPassword}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, adminPassword: e.target.value })
                    }
                    placeholder="رمز ورود مدیریت را وارد کنید"
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-amber-900 mt-1 block">
                    این رمز هنگام مراجعه به مسیر admin# از شما پرسیده خواهد شد.
                  </span>
                </div>
              </div>

              {/* اطلاعات تماس */}
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-blue-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>راه‌های ارتباطی و پشتیبانی:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      شماره تلفن و همراه پشتیبانی
                    </label>
                    <input
                      type="text"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      مدت‌زمان تخمینی ارسال کالا (نمایش به خریدار)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.deliveryTimeEstimate}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, deliveryTimeEstimate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      آیدی تلگرام پشتیبانی
                    </label>
                    <input
                      type="text"
                      value={tempSettings.telegramId}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, telegramId: e.target.value })
                      }
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      آیدی پیج اینستاگرام نوین فیلتر
                    </label>
                    <input
                      type="text"
                      value={tempSettings.instagramId}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, instagramId: e.target.value })
                      }
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* اطلاعات حساب بانکی کارت به کارت */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-amber-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>اطلاعات حساب بانکی واریزی (کارت به کارت):</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">نام بانک</label>
                    <input
                      type="text"
                      value={tempSettings.bankInfo.bankName}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          bankInfo: { ...tempSettings.bankInfo, bankName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      نام صاحب حساب (به نام نوین فیلتر)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.bankInfo.accountHolder}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          bankInfo: { ...tempSettings.bankInfo, accountHolder: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      شماره کارت ۱۶ رقمی
                    </label>
                    <input
                      type="text"
                      value={tempSettings.bankInfo.cardNumber}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          bankInfo: { ...tempSettings.bankInfo, cardNumber: e.target.value },
                        })
                      }
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      شماره شبا (IBAN)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.bankInfo.shebaNumber}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          bankInfo: { ...tempSettings.bankInfo, shebaNumber: e.target.value },
                        })
                      }
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* دکمه‌های ثبت */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تنظیمات سایت</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('آیا از بازنشانی کلیه داده‌ها به اطلاعات اولیه اطمینان دارید؟')) {
                      resetAllDataToDefaults();
                      alert('اطلاعات با موفقیت بازنشانی شد.');
                    }
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>بازنشانی به داده‌های آزمایشی اولیه</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* مودال افزودن/ویرایش محصول */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsProductModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct.id ? 'ویرایش اطلاعات محصول' : 'افزودن محصول جدید به کاتالوگ'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  عنوان کامل محصول
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  placeholder="مثلاً: روغن بهران رانا 10W-40 چهار لیتری"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">دسته‌بندی</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="service_pack">پک‌های سرویس اقتصادی</option>
                    <option value="engine_oil">روغن موتور</option>
                    <option value="oil_filter">فیلتر روغن</option>
                    <option value="air_filter">فیلتر هوا</option>
                    <option value="cabin_filter">فیلتر اتاق</option>
                    <option value="gearbox_oil">روغن گیربکس</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">برند</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    قیمت عادی (تومان)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">درصد تخفیف</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingProduct.discountPercent}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">موجودی انبار</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                  />
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 text-xs">
                      تصویر محصول (آپلود فایل، آدرس اینترنتی یا انتخاب از آرشیو)
                    </label>
                    {editingProduct.image && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold"
                      >
                        حذف تصویر
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* پیش‌نمایش زنده عکس */}
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center p-1 flex-shrink-0 shadow-2xs">
                      {editingProduct.image ? (
                        <img
                          src={resolveAssetUrl(editingProduct.image)}
                          alt="پیش‌نمایش"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center">بدون تصویر</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* دکمه انتخاب فایل از دستگاه */}
                      <div>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>انتخاب عکس از گوشی یا رایانه</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileUpload(file, (dataUrl) => {
                                  setEditingProduct({ ...editingProduct, image: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 mr-2">فرمت‌های JPG، PNG و WebP</span>
                      </div>

                      {/* فیلد آدرس مستقیم */}
                      <input
                        type="text"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        dir="ltr"
                        placeholder="یا آدرس عکس را اینجا قرار دهید: https://... یا assets/images/..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-left"
                      />
                    </div>
                  </div>

                  {/* دکمه‌های سریع آرشیو عکس‌های استودیویی */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                      انتخاب سریع از آرشیو عکس‌های واقعی نوین فیلتر:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/oil-behran-rana-10w40.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        بهران رانا ۱۰W-40
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/oil-behran-super-rana-5w30.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-amber-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        بهران سوپر رانا ۵W-30
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/oil-castrol-magnatec-10w40.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        کاسترول مگناتک ۱۰W-40
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/oil-behran-pishtaz-20w50.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        بهران پیشتاز ۲۰W-50
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-oil-serkan-sf7241-tu5.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر روغن TU5 سرکان (SF-7241)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-oil-serkan-sf7735-pride.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر روغن پراید/تیبا (SF-7735)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-oil-serkan-sf7110-ef7.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر روغن EF7 سرکان (SF-7110)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-air-ef7-dena.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-orange-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر هوا دنا و EF7
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-air-serkan-206-tu5.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-orange-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر هوا ۲۰۶ TU5
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/filter-cabin-carbon-206.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        فیلتر کابین کربن فعال
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: 'assets/images/products/oil-gear-behran-samand-75w80.jpg' })}
                        className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        واسکازین بهران سمند ۷۵W-80
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  خودروهای سازگار (با کاما جدا کنید)
                </label>
                <input
                  type="text"
                  value={editingProduct.compatibleCars.join('، ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      compatibleCars: e.target.value.split('،').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="پژو ۲۰۶، ۲۰۷، دنا پلاس، تارا..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isServicePack}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isServicePack: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="font-bold text-slate-800">این محصول یک «پک سرویس کامل» است</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="font-bold text-slate-800">موجود و قابل سفارش</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  توضیحات فنی و کاربرد محصول
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  ذخیره اطلاعات محصول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال پیش‌نمایش فیش واریزی */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            onClick={() => setViewingReceipt(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">تصویر فیش بانکی آپلود شده خریدار</h3>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              <img src={viewingReceipt} alt="فیش واریزی" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

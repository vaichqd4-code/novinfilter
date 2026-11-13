import React, { useEffect, useMemo, useState } from 'react';
import {
  Car,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Moon,
  Package,
  Phone,
  Plus,
  Printer,
  Radio,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order, Product, ProductCategory, SiteSettings } from '../types';
import {
  calculateDiscountedPrice,
  formatPrice,
  getCategoryTitle,
  toPersianDigits,
} from '../utils/shopUtils';
import { downloadCsvUtf8Bom } from '../utils/adminHelpers';
import { ProductImage } from './ProductImage';
import { resolveAssetUrl } from '../utils/assetHelper';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminProductModal } from './admin/AdminProductModal';
import { AdminVehiclesTab } from './admin/AdminVehiclesTab';
import { AdminBannersTab } from './admin/AdminBannersTab';

type AdminTabId =
  | 'overview'
  | 'products'
  | 'cars'
  | 'banners'
  | 'orders'
  | 'sms'
  | 'settings';

const ADMIN_THEME_KEY = 'novin_admin_theme';

export const AdminPanel: React.FC = () => {
  const {
    products,
    cars,
    orders,
    banners,
    siteSettings,
    otpLogs,
    clearOtpLogs,
    setActiveView,
    addProduct,
    updateProduct,
    deleteProduct,
    addCar,
    updateCar,
    deleteCar,
    setCarsList,
    updateOrderStatus,
    updateBanners,
    updateSiteSettings,
    importStoreBackup,
    resetAllDataToDefaults,
    isAdminAuthenticated,
    verifyAdminPassword,
    adminLogout,
  } = useShop();

  // تم روشن/تاریک اختصاصی پنل مدیریت
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_THEME_KEY, isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // احراز هویت ادمین
  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);

  // تب فعال
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  // فیلترهای محصولات
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);

  // مودال محصول / پک سرویس
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // سفارش‌ها: فیلتر و جستجو + فیش + فاکتور چاپی
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // پیامک و درگاه پیامک
  const [confirmClearOtp, setConfirmClearOtp] = useState(false);

  // تنظیمات و بازنشانی
  const [tempSettings, setTempSettings] = useState<SiteSettings>({ ...siteSettings });
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  useEffect(() => {
    setTempSettings({ ...siteSettings });
  }, [siteSettings]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // محصولات فیلترشده
  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedProductCategory !== 'all' && p.category !== selectedProductCategory) return false;
      if (stockFilter === 'in_stock' && (!p.isAvailable || p.stock <= 0)) return false;
      if (stockFilter === 'low_stock' && (!p.isAvailable || p.stock >= 10 || p.stock <= 0)) return false;
      if (stockFilter === 'out_of_stock' && p.isAvailable && p.stock > 0) return false;

      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.compatibleCars.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, selectedProductCategory, stockFilter, productSearch]);

  // سفارش‌های فیلترشده
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        return (
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customer.fullName.toLowerCase().includes(q) ||
          ord.customer.phone.toLowerCase().includes(q) ||
          ord.payment.trackingNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => !p.isAvailable || p.stock < 10).length;

  // فرم ورود ادمین در صورت عدم احراز هویت
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-900 p-0.5 shadow-md flex items-center justify-center border border-slate-200">
              <img
                src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
                alt="نوین فیلتر"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              ورود امن به کنسول مدیریت نوین فیلتر
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              این بخش مخصوص مدیر فروشگاه است. رمز عبور مدیریت را وارد کنید:
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
                  placeholder="رمز مدیریت..."
                  dir="ltr"
                  autoFocus
                  required
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-center tracking-widest"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                رمز پیش‌فرض: <code className="font-mono text-blue-700 font-bold">novin1405</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
            >
              ورود به پنل مدیریت
            </button>

            <button
              type="button"
              onClick={() => setActiveView('shop')}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              ← انصراف و بازگشت به فروشگاه
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleOpenAddProduct = (asPack = false) => {
    setEditingProduct({
      id: '',
      title: '',
      category: asPack ? 'service_pack' : 'engine_oil',
      brand: 'نوین فیلتر',
      price: asPack ? 1200000 : 500000,
      discountPercent: 10,
      stock: 20,
      rating: 5,
      reviewsCount: 1,
      image: asPack ? 'assets/images/products/oil-behran-rana-10w40.jpg' : '',
      gallery: [],
      compatibleCars: ['پژو ۲۰۶', 'پژو ۲۰۷', 'دنا'],
      description: asPack
        ? 'پک کامل سرویس دوره‌ای شامل روغن موتور و فیلترهای اصلی استاندارد کارخانه.'
        : 'توضیحات فنی کامل محصول و مشخصات روانکاری...',
      technicalSpecs: {
        viscosity: '10W-40',
        apiStandard: 'API SN',
        volume: '۴ لیتر',
      },
      tags: ['ویژه'],
      isServicePack: asPack,
      packIncludes: asPack ? [] : undefined,
      packImages: asPack ? [] : undefined,
      packDiscountAdditional: asPack ? 10 : undefined,
      isAvailable: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = (prod: Product) => {
    const { id, rating, reviewsCount, ...rest } = prod;
    addProduct({
      ...rest,
      title: `${prod.title} (کپی)`,
    });
    showToast(`محصول «${prod.title}» با موفقیت کپی شد.`);
  };

  const handleSaveProductModal = (saved: Product) => {
    if (saved.id) {
      updateProduct(saved.id, saved);
      showToast(`تغییرات «${saved.title}» ذخیره شد.`);
    } else {
      const { id, rating, reviewsCount, ...rest } = saved;
      addProduct(rest);
      showToast(`«${saved.title}» به کاتالوگ فروشگاه اضافه شد.`);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(tempSettings);
    setSettingsSavedFeedback(true);
    setTimeout(() => setSettingsSavedFeedback(false), 3000);
  };

  const handleExportOrdersCsv = () => {
    const statusMap: Record<Order['status'], string> = {
      pending: 'در انتظار بررسی',
      approved: 'تایید شده',
      shipped: 'ارسال شده',
    };
    downloadCsvUtf8Bom(
      `novin-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ['شماره سفارش', 'تاریخ', 'نام مشتری', 'موبایل', 'شهر', 'آدرس', 'شماره پیگیری', 'مبلغ نهایی', 'وضعیت'],
      filteredOrders.map((o) => [
        o.orderNumber,
        o.date,
        o.customer.fullName,
        o.customer.phone,
        `${o.customer.province} - ${o.customer.city}`,
        o.customer.address,
        o.payment.trackingNumber,
        o.finalAmount,
        statusMap[o.status],
      ])
    );
    showToast('خروجی اکسل سفارش‌ها دانلود شد.');
  };

  const navItems: {
    id: AdminTabId;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'نمای کلی و آمار',
      subtitle: 'گزارش لحظه‌ای فروش، موجودی انبار و پشتیبان‌گیری',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'محصولات و پک‌ها',
      subtitle: 'ویرایش سریع قیمت/موجودی و سازنده هیبریدی پک سرویس',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? toPersianDigits(lowStockCount) : undefined,
    },
    {
      id: 'cars',
      label: 'مدیریت خودروها',
      subtitle: 'افزودن، مرتب‌سازی و عکس خودروهای دکمه‌های فیلتر',
      icon: <Car className="w-4 h-4" />,
      badge: toPersianDigits(cars.length),
    },
    {
      id: 'banners',
      label: 'بنرها و اسلایدر',
      subtitle: 'اسلایدر اصلی، کارت‌های تبلیغاتی و پیش‌نمایش زنده',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'سفارش‌ها و فاکتور',
      subtitle: 'بررسی فیش واریزی، تغییر وضعیت و چاپ فاکتور',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? toPersianDigits(pendingOrdersCount) : undefined,
    },
    {
      id: 'sms',
      label: 'پیامک و درگاه OTP',
      subtitle: 'تنظیمات درگاه پیامک و لاگ کدهای تایید ارسال‌شده',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'تنظیمات فروشگاه',
      subtitle: 'رمز پنل، اطلاعات بانکی کارت‌به‌کارت و تماس',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const activeNavMeta = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div
        className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors"
        dir="rtl"
      >
        {/* سایدبار دسکتاپ */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-slate-900 text-slate-100 border-l border-slate-800 flex-shrink-0 sticky top-0 h-screen">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
              <img
                src={resolveAssetUrl('assets/aistudio/1000030421_ab989be0.png')}
                alt="نوین فیلتر"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-white truncate">نوین فیلتر</div>
              <div className="text-[11px] text-slate-400">کنسول مدیریت</div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black tabular-nums ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => setActiveView('shop')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              <span>مشاهده فروشگاه</span>
            </button>
            <button
              type="button"
              onClick={adminLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-xl text-xs font-semibold transition whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از مدیریت</span>
            </button>
          </div>
        </aside>

        {/* ستون اصلی محتوا */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* هدر بالایی چسبان */}
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {activeNavMeta.label}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {activeNavMeta.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    handleOpenAddProduct(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ساخت پک جدید</span>
                  <span className="sm:hidden">پک جدید</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDarkMode((d) => !d)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                  title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
                  aria-label="تغییر تم روشن و تاریک"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('shop')}
                  className="lg:hidden inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>سایت</span>
                </button>

                <button
                  type="button"
                  onClick={adminLogout}
                  className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700"
                  title="خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* نوار ناوبری افقی موبایل و تبلت */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 pb-0.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </header>

          {/* فضای اصلی تب‌ها */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
            {toastNotice && (
              <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {toastNotice}
                </span>
                <button type="button" onClick={() => setToastNotice(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ۰. نمای کلی */}
            {activeTab === 'overview' && (
              <AdminDashboardTab
                products={products}
                cars={cars}
                orders={orders}
                banners={banners}
                otpLogs={otpLogs}
                siteSettings={siteSettings}
                onNavigateTab={setActiveTab}
                onOpenNewPack={() => {
                  setActiveTab('products');
                  handleOpenAddProduct(true);
                }}
                onOpenNewProduct={() => {
                  setActiveTab('products');
                  handleOpenAddProduct(false);
                }}
                onQuickRestock={(productId, delta) => {
                  const target = products.find((p) => p.id === productId);
                  if (!target) return;
                  updateProduct(productId, {
                    stock: Math.max(0, target.stock + delta),
                    isAvailable: true,
                  });
                  showToast(`موجودی «${target.title}» +${toPersianDigits(delta)} عدد شارژ شد.`);
                }}
                onQuickOrderApprove={(orderId) => {
                  updateOrderStatus(orderId, 'approved');
                  showToast('سفارش تایید و به مرحله آماده‌سازی منتقل شد.');
                }}
                onImportBackup={(payload) => {
                  const ok = importStoreBackup(payload);
                  if (ok) showToast('بازیابی نسخه پشتیبان با موفقیت انجام شد.');
                  return ok;
                }}
              />
            )}

            {/* ۱. محصولات و پک‌ها */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative min-w-[220px] flex-1 max-w-xs">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="جستجوی عنوان، برند یا خودرو..."
                        className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                      value={selectedProductCategory}
                      onChange={(e) =>
                        setSelectedProductCategory(e.target.value as ProductCategory | 'all')
                      }
                      className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                    >
                      <option value="all">همه دسته‌ها ({toPersianDigits(products.length)})</option>
                      <option value="service_pack">پک‌های سرویس اقتصادی</option>
                      <option value="engine_oil">روغن موتور</option>
                      <option value="oil_filter">فیلتر روغن</option>
                      <option value="air_filter">فیلتر هوا</option>
                      <option value="cabin_filter">فیلتر اتاق</option>
                      <option value="gearbox_oil">روغن گیربکس</option>
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) =>
                        setStockFilter(
                          e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
                        )
                      }
                      className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                    >
                      <option value="all">وضعیت موجودی: همه</option>
                      <option value="in_stock">فقط موجود</option>
                      <option value="low_stock">کم‌موجودی (زیر ۱۰ عدد)</option>
                      <option value="out_of_stock">ناموجود</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAddProduct(true)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Layers className="w-4 h-4" />
                      <span>ساخت پک سرویس جدید</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAddProduct(false)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن محصول تکی</span>
                    </button>
                  </div>
                </div>

                {/* جدول محصولات با ویرایش سریع داخل ردیف */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                      <tr>
                        <th className="p-3">تصویر</th>
                        <th className="p-3">عنوان و برند</th>
                        <th className="p-3">دسته / نوع</th>
                        <th className="p-3">قیمت پایه (تومان)</th>
                        <th className="p-3">تخفیف (%)</th>
                        <th className="p-3">موجودی</th>
                        <th className="p-3">وضعیت</th>
                        <th className="p-3 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAdminProducts.map((p) => {
                        const finalUnit = calculateDiscountedPrice(p.price, p.discountPercent);
                        const isConfirmingDelete = confirmDeleteProductId === p.id;
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                          >
                            <td className="p-3 w-16">
                              <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1">
                                <ProductImage
                                  src={p.image}
                                  packImages={p.packImages}
                                  alt={p.title}
                                  category={p.category}
                                  title={p.title}
                                  brand={p.brand}
                                  viscosity={p.technicalSpecs?.viscosity}
                                  compact
                                />
                              </div>
                            </td>
                            <td className="p-3 min-w-[200px] max-w-xs">
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-2">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {p.brand}
                                {p.isServicePack && p.packIncludes?.length
                                  ? ` • ${toPersianDigits(p.packIncludes.length)} قلم پک`
                                  : ''}
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="text-slate-700 dark:text-slate-300 font-medium">
                                {getCategoryTitle(p.category)}
                              </div>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.isServicePack
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {p.isServicePack ? 'پک کامل' : 'تکی'}
                              </span>
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={p.price}
                                onChange={(e) =>
                                  updateProduct(p.id, { price: Math.max(0, Number(e.target.value)) })
                                }
                                dir="ltr"
                                aria-label={`قیمت ${p.title}`}
                                className="w-28 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-left tabular-nums"
                              />
                              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                                نهایی: {formatPrice(finalUnit)}
                              </div>
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                max={95}
                                value={p.discountPercent}
                                onChange={(e) =>
                                  updateProduct(p.id, {
                                    discountPercent: Math.min(95, Math.max(0, Number(e.target.value))),
                                  })
                                }
                                dir="ltr"
                                aria-label={`تخفیف ${p.title}`}
                                className="w-16 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-center tabular-nums"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                value={p.stock}
                                onChange={(e) => {
                                  const nextStock = Math.max(0, Number(e.target.value));
                                  updateProduct(p.id, {
                                    stock: nextStock,
                                    isAvailable: nextStock > 0 ? p.isAvailable : false,
                                  });
                                }}
                                dir="ltr"
                                aria-label={`موجودی ${p.title}`}
                                className="w-16 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-center tabular-nums"
                              />
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => updateProduct(p.id, { isAvailable: !p.isAvailable })}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                                  p.isAvailable && p.stock > 0
                                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300'
                                }`}
                              >
                                {p.isAvailable && p.stock > 0 ? 'موجود' : 'ناموجود'}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                                  title="ویرایش کامل"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                  title="کپی محصول"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>

                                {isConfirmingDelete ? (
                                  <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg px-2 py-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deleteProduct(p.id);
                                        setConfirmDeleteProductId(null);
                                        showToast(`«${p.title}» حذف شد.`);
                                      }}
                                      className="font-bold text-red-700 dark:text-red-300"
                                    >
                                      حذف
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteProductId(null)}
                                      className="text-slate-500"
                                    >
                                      لغو
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteProductId(p.id)}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                                    title="حذف محصول"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ۲. مدیریت خودروها */}
            {activeTab === 'cars' && (
              <AdminVehiclesTab
                cars={cars}
                onAddCar={(c) => {
                  addCar(c);
                  showToast(`خودرو «${c.name}» به سایت اضافه شد.`);
                }}
                onUpdateCar={updateCar}
                onDeleteCar={deleteCar}
                onReorderCars={setCarsList}
              />
            )}

            {/* ۳. مدیریت بنرها */}
            {activeTab === 'banners' && (
              <AdminBannersTab
                banners={banners}
                cars={cars}
                onSaveBanners={(next) => {
                  updateBanners(next);
                  showToast('تغییرات بنرها و اسلایدرها با موفقیت ذخیره شد.');
                }}
              />
            )}

            {/* ۴. سفارش‌ها و چاپ فاکتور */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: `همه (${toPersianDigits(orders.length)})` },
                        {
                          id: 'pending',
                          label: `در انتظار (${toPersianDigits(orders.filter((o) => o.status === 'pending').length)})`,
                        },
                        {
                          id: 'approved',
                          label: `تایید شده (${toPersianDigits(orders.filter((o) => o.status === 'approved').length)})`,
                        },
                        {
                          id: 'shipped',
                          label: `ارسال شده (${toPersianDigits(orders.filter((o) => o.status === 'shipped').length)})`,
                        },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(st.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          orderStatusFilter === st.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="شماره سفارش، نام یا موبایل..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                      type="button"
                      onClick={handleExportOrdersCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>خروجی اکسل</span>
                    </button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                    سفارشی با این مشخصات یافت نشد.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800 tabular-nums">
                              {ord.orderNumber}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                              {ord.date}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPrintingOrder(ord)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>پیش‌نمایش فاکتور</span>
                            </button>

                            <select
                              value={ord.status}
                              onChange={(e) =>
                                updateOrderStatus(ord.id, e.target.value as Order['status'])
                              }
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                                ord.status === 'approved'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                  : ord.status === 'shipped'
                                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              }`}
                            >
                              <option value="pending">در انتظار بررسی</option>
                              <option value="approved">تایید و آماده بسته‌بندی</option>
                              <option value="shipped">ارسال شده</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">مشخصات خریدار:</h4>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold">
                              {ord.customer.fullName}
                            </p>
                            <p className="text-blue-700 dark:text-blue-400 font-mono font-semibold" dir="ltr">
                              {ord.customer.phone}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                              {ord.customer.province} - {ord.customer.city}، {ord.customer.address}
                            </p>
                            <p className="text-slate-400 tabular-nums">
                              کد پستی: {ord.customer.postalCode}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-white">اطلاعات واریز:</h4>
                            <p className="text-slate-600 dark:text-slate-300">
                              شماره پیگیری:
                              <span className="font-mono font-bold text-slate-900 dark:text-white mr-1">
                                {ord.payment.trackingNumber}
                              </span>
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white tabular-nums">
                              مبلغ واریزی: {formatPrice(ord.finalAmount)}
                            </p>

                            {ord.payment.receiptImage && (
                              <button
                                type="button"
                                onClick={() => setViewingReceipt(ord.payment.receiptImage || '')}
                                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-bold text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>مشاهده فیش واریزی</span>
                              </button>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                              اقلام سفارش ({toPersianDigits(ord.items.length)}):
                            </h4>
                            <div className="space-y-1 max-h-28 overflow-y-auto">
                              {ord.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[11px] py-1 border-b border-slate-200/60 dark:border-slate-700/60 last:border-0"
                                >
                                  <span className="truncate max-w-[170px] text-slate-700 dark:text-slate-300">
                                    {item.title}
                                  </span>
                                  <span className="font-bold tabular-nums">
                                    {toPersianDigits(item.quantity)} عدد
                                  </span>
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

            {/* ۵. پیامک و درگاه OTP */}
            {activeTab === 'sms' && (
              <div className="space-y-5">
                {/* تنظیمات درگاه پیامک */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>پیکربندی سرویس‌دهنده پیامک (OTP)</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        انتخاب پنل پیامکی متصل به احراز هویت خریداران
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateSiteSettings({ smsGateway: tempSettings.smsGateway });
                        showToast('تنظیمات درگاه پیامک ذخیره شد.');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>ذخیره درگاه پیامک</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        سرویس‌دهنده
                      </label>
                      <select
                        value={tempSettings.smsGateway.provider}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            smsGateway: {
                              ...tempSettings.smsGateway,
                              provider: e.target.value as SiteSettings['smsGateway']['provider'],
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                      >
                        <option value="simulator">شبیه‌ساز هوشمند داخل پنل</option>
                        <option value="kavenegar">کاوه‌نگار (Kavenegar)</option>
                        <option value="melipayamak">ملی‌پیامک (MeliPayamak)</option>
                        <option value="farazsms">فراز اس‌ام‌اس (FarazSMS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        کلید وب‌سرویس (API Key)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.smsGateway.apiKey || ''}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            smsGateway: { ...tempSettings.smsGateway, apiKey: e.target.value },
                          })
                        }
                        dir="ltr"
                        placeholder="API Key..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        شماره خط ارسال‌کننده
                      </label>
                      <input
                        type="text"
                        value={tempSettings.smsGateway.senderNumber || ''}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            smsGateway: { ...tempSettings.smsGateway, senderNumber: e.target.value },
                          })
                        }
                        dir="ltr"
                        placeholder="3000..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        کد الگوی تایید (Pattern)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.smsGateway.patternCode || ''}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            smsGateway: { ...tempSettings.smsGateway, patternCode: e.target.value },
                          })
                        }
                        dir="ltr"
                        placeholder="verify-novin"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* لاگ پیامک‌های ارسالی */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        لاگ پیامک‌های ارسالی و کدهای ورود ({toPersianDigits(otpLogs.length)})
                      </h3>
                    </div>

                    {otpLogs.length > 0 &&
                      (confirmClearOtp ? (
                        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl text-xs">
                          <span className="text-red-700 dark:text-red-300 font-bold">
                            پاکسازی کامل لاگ‌ها؟
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              clearOtpLogs();
                              setConfirmClearOtp(false);
                              showToast('تاریخچه پیامک‌ها پاک شد.');
                            }}
                            className="font-black text-red-700 dark:text-red-200 underline"
                          >
                            بله، پاک شود
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmClearOtp(false)}
                            className="text-slate-500"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmClearOtp(true)}
                          className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-800 font-bold transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>پاکسازی لاگ پیامک‌ها</span>
                        </button>
                      ))}
                  </div>

                  {otpLogs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      هنوز پیامکی ثبت نشده است.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-3.5">شماره همراه گیرنده</th>
                            <th className="p-3.5 text-center">کد تایید (OTP)</th>
                            <th className="p-3.5">زمان ارسال</th>
                            <th className="p-3.5">درگاه پیامک</th>
                            <th className="p-3.5 text-center">وضعیت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {otpLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="p-3.5 font-mono font-bold tabular-nums" dir="ltr">
                                {log.phone}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="font-mono text-sm font-black px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 rounded-lg border border-amber-300 dark:border-amber-700">
                                  {log.code}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-500 dark:text-slate-400 tabular-nums">
                                {log.formattedTime}
                              </td>
                              <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.gateway}</td>
                              <td className="p-3.5 text-center">
                                {log.status === 'verified' ? (
                                  <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>تایید شد</span>
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                                    ارسال شده
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
              </div>
            )}

            {/* ۶. تنظیمات فروشگاه */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      تنظیمات عمومی، حساب بانکی و امنیت پنل
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      به‌روزرسانی رمز ورود مدیر، اطلاعات کارت‌به‌کارت و راه‌های ارتباطی سایت
                    </p>
                  </div>
                  {settingsSavedFeedback && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تنظیمات ذخیره شد</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-2xl space-y-2.5">
                    <h3 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>رمز عبور پنل مدیریت</span>
                    </h3>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        value={tempSettings.adminPassword}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, adminPassword: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>اطلاعات تماس و ارسال:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          شماره تماس پشتیبانی
                        </label>
                        <input
                          type="text"
                          value={tempSettings.phone}
                          onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          زمان تقریبی تحویل کالا
                        </label>
                        <input
                          type="text"
                          value={tempSettings.deliveryTimeEstimate}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              deliveryTimeEstimate: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          آیدی تلگرام
                        </label>
                        <input
                          type="text"
                          value={tempSettings.telegramId}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, telegramId: e.target.value })
                          }
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          آیدی اینستاگرام
                        </label>
                        <input
                          type="text"
                          value={tempSettings.instagramId}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, instagramId: e.target.value })
                          }
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      <span>اطلاعات حساب بانکی کارت‌به‌کارت:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          نام بانک
                        </label>
                        <input
                          type="text"
                          value={tempSettings.bankInfo.bankName}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              bankInfo: { ...tempSettings.bankInfo, bankName: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          نام صاحب حساب
                        </label>
                        <input
                          type="text"
                          value={tempSettings.bankInfo.accountHolder}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              bankInfo: {
                                ...tempSettings.bankInfo,
                                accountHolder: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>ذخیره تنظیمات سایت</span>
                    </button>

                    {confirmResetOpen ? (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-3.5 py-2 rounded-xl">
                        <span className="font-bold text-red-700 dark:text-red-300">
                          بازگشت کل سایت به حالت پیش‌فرض اولیه؟
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            resetAllDataToDefaults();
                            setConfirmResetOpen(false);
                            showToast('تمام اطلاعات فروشگاه به مقادیر پیش‌فرض بازنشانی شد.');
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold"
                        >
                          تایید بازنشانی
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmResetOpen(false)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300"
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmResetOpen(true)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>بازنشانی به داده‌های اولیه</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* مودال افزودن/ویرایش محصول و سازنده پک سرویس */}
      {isProductModalOpen && editingProduct && (
        <AdminProductModal
          initialProduct={editingProduct}
          allProducts={products}
          cars={cars}
          onSave={handleSaveProductModal}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* مودال پیش‌نمایش فیش واریزی */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" dir="rtl">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setViewingReceipt(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl z-10 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                تصویر فیش بانکی واریزی
              </h3>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
              <img src={viewingReceipt} alt="فیش واریزی" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* مودال پیش‌نمایش و چاپ فاکتور رسمی سفارش */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" dir="rtl">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setPrintingOrder(null)}
          />
          <div className="relative bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  فاکتور فروش فروشگاه تخصصی نوین فیلتر
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  شماره سفارش: {printingOrder.orderNumber} • تاریخ: {printingOrder.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ فاکتور</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-slate-900">مشخصات خریدار</div>
                <div>نام: {printingOrder.customer.fullName}</div>
                <div>تلفن: {printingOrder.customer.phone}</div>
                <div>
                  نشانی: {printingOrder.customer.province}، {printingOrder.customer.city}،{' '}
                  {printingOrder.customer.address}
                </div>
                <div className="tabular-nums">کد پستی: {printingOrder.customer.postalCode}</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">جزئیات پرداخت و ارسال</div>
                <div>شماره پیگیری: {printingOrder.payment.trackingNumber}</div>
                <div>زمان تخمینی ارسال: {printingOrder.deliveryEstimate}</div>
                <div>تلفن پشتیبانی: {siteSettings.phone}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ردیف</th>
                    <th className="p-3">شرح کالا</th>
                    <th className="p-3 text-center">تعداد</th>
                    <th className="p-3 text-left">مبلغ واحد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printingOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 tabular-nums">{toPersianDigits(idx + 1)}</td>
                      <td className="p-3 font-semibold">{it.title}</td>
                      <td className="p-3 text-center tabular-nums">{toPersianDigits(it.quantity)}</td>
                      <td className="p-3 text-left font-bold tabular-nums">
                        {formatPrice(it.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
              <div className="text-slate-500">
                تخفیف کل: <strong className="text-rose-600 tabular-nums">{formatPrice(printingOrder.discountAmount)}</strong> • هزینه ارسال:{' '}
                <strong className="tabular-nums">
                  {printingOrder.shippingFee === 0 ? 'رایگان' : formatPrice(printingOrder.shippingFee)}
                </strong>
              </div>
              <div className="text-sm font-black text-slate-900 tabular-nums">
                مبلغ قابل پرداخت: {formatPrice(printingOrder.finalAmount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

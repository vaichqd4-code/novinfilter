import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpLeft,
  Car,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { Banner, CarModel, Order, OtpLog, Product, SiteSettings } from '../../types';
import { formatPrice, getCategoryTitle, toPersianDigits } from '../../utils/shopUtils';
import { downloadCsvUtf8Bom, downloadJsonFile } from '../../utils/adminHelpers';
import { ProductImage } from '../ProductImage';

interface AdminDashboardTabProps {
  products: Product[];
  cars: CarModel[];
  orders: Order[];
  banners: Banner[];
  otpLogs: OtpLog[];
  siteSettings: SiteSettings;
  onNavigateTab: (tab: 'overview' | 'products' | 'cars' | 'banners' | 'orders' | 'sms' | 'settings') => void;
  onOpenNewPack: () => void;
  onOpenNewProduct: () => void;
  onQuickRestock: (productId: string, delta: number) => void;
  onQuickOrderApprove: (orderId: string) => void;
  onImportBackup: (payload: {
    products?: Product[];
    cars?: CarModel[];
    banners?: Banner[];
    siteSettings?: Partial<SiteSettings>;
  }) => boolean;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  products,
  cars,
  orders,
  banners,
  otpLogs,
  siteSettings,
  onNavigateTab,
  onOpenNewPack,
  onOpenNewProduct,
  onQuickRestock,
  onQuickOrderApprove,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const revenueOrders = orders.filter((o) => o.status === 'approved' || o.status === 'shipped');
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockProducts = products.filter((p) => !p.isAvailable || p.stock < 10);
  const activePacksCount = products.filter((p) => p.isServicePack && p.isAvailable).length;
  const activeCarsCount = cars.filter((c) => c.isActive).length;
  const activeBannersCount = banners.filter((b) => b.isActive).length;

  const handleExportOrdersCsv = () => {
    const statusMap: Record<Order['status'], string> = {
      pending: 'در انتظار بررسی',
      approved: 'تایید شده',
      shipped: 'ارسال شده',
    };
    downloadCsvUtf8Bom(
      `novin-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ['شماره سفارش', 'تاریخ', 'نام مشتری', 'موبایل', 'استان و شهر', 'آدرس', 'شماره پیگیری', 'مبلغ نهایی (تومان)', 'وضعیت', 'تعداد اقلام'],
      orders.map((o) => [
        o.orderNumber,
        o.date,
        o.customer.fullName,
        o.customer.phone,
        `${o.customer.province} - ${o.customer.city}`,
        o.customer.address,
        o.payment.trackingNumber,
        o.finalAmount,
        statusMap[o.status],
        o.items.reduce((acc, it) => acc + it.quantity, 0),
      ])
    );
    setBackupMessage({ type: 'ok', text: 'فایل اکسل (CSV) سفارش‌ها آماده و دانلود شد.' });
  };

  const handleExportProductsCsv = () => {
    downloadCsvUtf8Bom(
      `novin-products-${new Date().toISOString().slice(0, 10)}.csv`,
      ['کد', 'عنوان محصول', 'دسته‌بندی', 'برند', 'قیمت (تومان)', 'تخفیف (%)', 'موجودی', 'وضعیت', 'نوع', 'خودروهای سازگار'],
      products.map((p) => [
        p.id,
        p.title,
        getCategoryTitle(p.category),
        p.brand,
        p.price,
        p.discountPercent,
        p.stock,
        p.isAvailable ? 'موجود' : 'ناموجود',
        p.isServicePack ? 'پک سرویس' : 'تکی',
        p.compatibleCars.join('، '),
      ])
    );
    setBackupMessage({ type: 'ok', text: 'فایل اکسل (CSV) محصولات و موجودی دانلود شد.' });
  };

  const handleDownloadJsonBackup = () => {
    downloadJsonFile(`novinfilter-backup-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      version: 2,
      products,
      cars,
      banners,
      siteSettings,
    });
    setBackupMessage({ type: 'ok', text: 'فایل پشتیبان کامل فروشگاه (JSON) ذخیره شد.' });
  };

  const handleImportJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const ok = onImportBackup(parsed);
        setBackupMessage(
          ok
            ? { type: 'ok', text: 'بازیابی نسخه پشتیبان با موفقیت انجام شد و اطلاعات به‌روز شدند.' }
            : { type: 'err', text: 'فرمت فایل پشتیبان معتبر نبود.' }
        );
      } catch {
        setBackupMessage({ type: 'err', text: 'خطا در خواندن فایل JSON.' });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* ردیف آمار کلیدی (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              درآمد سفارش‌های تاییدشده
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatPrice(totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toPersianDigits(revenueOrders.length)} سفارش تایید/ارسال‌شده</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('orders')}
          className="text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-5 flex items-start justify-between gap-3 transition"
        >
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              سفارش‌های در انتظار بررسی
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(pendingOrders.length)}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>کل سفارش‌ها: {toPersianDigits(orders.length)}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('products')}
          className="text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-2xl p-5 flex items-start justify-between gap-3 transition"
        >
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              هشدار موجودی و ناموجودها
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(lowStockProducts.length)}
            </div>
            <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>از {toPersianDigits(products.length)} محصول کاتالوگ</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('cars')}
          className="text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-5 flex items-start justify-between gap-3 transition"
        >
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              پک‌های سرویس و خودروها
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(activePacksCount)} پک / {toPersianDigits(activeCarsCount)} خودرو
            </div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              <span>{toPersianDigits(activeBannersCount)} بنر فعال • {toPersianDigits(otpLogs.length)} پیامک</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* عملیات سریع فروشگاه */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            دسترسی سریع مدیر فروشگاه
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ساخت پک سرویس دوره‌ای جدید، افزودن خودرو یا مدیریت اسلایدرهای صفحه اصلی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewPack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            <span>ساخت پک سرویس جدید</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن محصول تکی</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('cars')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Car className="w-4 h-4" />
            <span>مدیریت خودروها</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('banners')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <ArrowUpLeft className="w-4 h-4" />
            <span>ویرایش بنرها</span>
          </button>
        </div>
      </div>

      {/* دو ستون عملیاتی: سفارش‌های در انتظار و هشدارهای موجودی */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* صف سفارش‌های منتظر تایید */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>سفارش‌های منتظر تایید</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              مشاهده همه ({toPersianDigits(orders.length)})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 mt-2">
            {pendingOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                همه سفارش‌ها بررسی شده‌اند. سفارش در انتظاری وجود ندارد.
              </div>
            ) : (
              pendingOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {ord.customer.fullName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {formatPrice(ord.finalAmount)} • {ord.customer.city}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickOrderApprove(ord.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition whitespace-nowrap flex-shrink-0"
                  >
                    تایید فوری
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* اقلام کم‌موجودی / ناموجود */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>محصولات نیازمند شارژ انبار</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              مدیریت موجودی
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 mt-2">
            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                موجودی تمام اقلام فروشگاه در وضعیت مطلوب (۱۰ عدد به بالا) است.
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1 flex-shrink-0">
                      <ProductImage
                        src={p.image}
                        packImages={p.packImages}
                        alt={p.title}
                        category={p.category}
                        title={p.title}
                        brand={p.brand}
                        compact
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                        {!p.isAvailable ? 'وضعیت: ناموجود' : `موجودی فعلی: ${toPersianDigits(p.stock)} عدد`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onQuickRestock(p.id, 10)}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition whitespace-nowrap flex-shrink-0 tabular-nums"
                  >
                    +۱۰ عدد شارژ
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* پنل خروجی اکسل و پشتیبان‌گیری JSON */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              خروجی گزارش‌های اکسل (CSV) و پشتیبان‌گیری کامل
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              خروجی فارسی بدون بهم‌ریختگی حروف در اکسل و تهیه یا بازیابی فایل JSON کل تنظیمات، محصولات، خودروها و بنرها
            </p>
          </div>

          {backupMessage && (
            <div
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                backupMessage.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}
            >
              {backupMessage.text}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportOrdersCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>خروجی اکسل سفارش‌ها</span>
          </button>

          <button
            type="button"
            onClick={handleExportProductsCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>خروجی اکسل محصولات</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJsonBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>دانلود پشتیبان کل (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition whitespace-nowrap">
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>بازیابی از فایل JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportJsonChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

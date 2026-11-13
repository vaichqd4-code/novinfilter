import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Eye,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { Banner, CarModel } from '../../types';
import { resolveAssetUrl } from '../../utils/assetHelper';
import { toPersianDigits } from '../../utils/shopUtils';
import { BANNER_ARCHIVE_PRESETS, compressImageFile } from '../../utils/adminHelpers';

interface AdminBannersTabProps {
  banners: Banner[];
  cars: CarModel[];
  onSaveBanners: (nextBanners: Banner[]) => void;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  banners,
  cars,
  onSaveBanners,
}) => {
  const [tempBanners, setTempBanners] = useState<Banner[]>(banners);
  const [isDirty, setIsDirty] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewBannerId, setPreviewBannerId] = useState<string | null>(
    banners[0]?.id || null
  );

  // همگام‌سازی خودکار هنگام بازیابی بک‌آپ یا بازنشانی کارخانه
  useEffect(() => {
    setTempBanners(banners);
    setIsDirty(false);
  }, [banners]);

  const markUpdated = (next: Banner[]) => {
    setTempBanners(next);
    setIsDirty(true);
    setSavedNotice(false);
  };

  const handleSave = () => {
    onSaveBanners(tempBanners);
    setIsDirty(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleAddBanner = (type: 'slider' | 'promo_card') => {
    const newBanner: Banner = {
      id: `${type === 'slider' ? 'slide' : 'promo'}-${Date.now()}`,
      title: type === 'slider' ? 'اسلاید جدید نوین فیلتر' : 'پیشنهاد ویژه جدید',
      subtitle:
        type === 'slider'
          ? 'تضمین اصالت روغن موتور و فیلترهای اصلی با ارسال سریع'
          : 'تخفیف اختصاصی پک سرویس',
      type,
      imageUrl:
        type === 'slider'
          ? 'assets/images/banners/hero-packs-showcase.jpg'
          : 'assets/images/banners/promo-ikco-tu5.jpg',
      linkUrl: '#packs',
      badgeText: type === 'slider' ? 'پیشنهاد ویژه' : 'ارسال سریع',
      isActive: true,
      recommendedSize: type === 'slider' ? '1200x400' : '600x300',
    };
    const next = [...tempBanners, newBanner];
    markUpdated(next);
    setPreviewBannerId(newBanner.id);
  };

  const handleDuplicate = (index: number) => {
    const src = tempBanners[index];
    const copy: Banner = {
      ...src,
      id: `${src.type}-${Date.now()}`,
      title: `${src.title} (کپی)`,
    };
    const next = [...tempBanners];
    next.splice(index + 1, 0, copy);
    markUpdated(next);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tempBanners.length) return;
    const next = [...tempBanners];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    markUpdated(next);
  };

  const handleUploadBannerImage = async (index: number, file: File) => {
    try {
      const dataUrl = await compressImageFile(file, 1280, 0.85);
      const next = [...tempBanners];
      next[index] = { ...next[index], imageUrl: dataUrl };
      markUpdated(next);
    } catch {
      // ignore invalid file
    }
  };

  const activePreview =
    tempBanners.find((b) => b.id === previewBannerId) || tempBanners[0] || null;

  return (
    <div className="space-y-5">
      {/* هدر ابزارهای بنر */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>مدیریت اسلایدرها و بنرهای تبلیغاتی ({toPersianDigits(tempBanners.length)})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            افزودن اسلاید یا کارت تبلیغاتی، جابجایی ترتیب، اتصال به خودرو و مشاهده پیش‌نمایش زنده
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddBanner('slider')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن اسلاید اصلی</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddBanner('promo_card')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن کارت تبلیغاتی</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isDirty ? 'ذخیره تغییرات بنرها*' : 'ذخیره تغییرات بنرها'}</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تمام بنرها و اسلایدرها در فروشگاه ذخیره و منتشر شدند.</span>
        </div>
      )}

      {/* پیش‌نمایش زنده RTL بنر انتخاب‌شده */}
      {activePreview && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>پیش‌نمایش زنده در سایت: «{activePreview.title}»</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              نوع: {activePreview.type === 'slider' ? 'اسلایدر عریض (۱۲۰۰×۴۰۰)' : 'کارت تبلیغاتی (۶۰۰×۳۰۰)'}
            </span>
          </div>

          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 ${
              activePreview.type === 'slider' ? 'h-48 sm:h-56' : 'h-40 max-w-xl'
            }`}
          >
            {activePreview.imageUrl && (
              <img
                src={resolveAssetUrl(activePreview.imageUrl)}
                alt={activePreview.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/90 via-slate-950/60 to-slate-950/15" />
            <div className="relative z-10 h-full p-5 sm:p-7 flex flex-col justify-center items-start text-right max-w-lg gap-2">
              {activePreview.badgeText && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black">
                  {activePreview.badgeText}
                </span>
              )}
              <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                {activePreview.title}
              </h3>
              {activePreview.subtitle && (
                <p className="text-xs text-slate-200 line-clamp-2">{activePreview.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* کارت‌های ویرایش تک‌تک بنرها */}
      <div className="space-y-4">
        {tempBanners.map((banner, index) => (
          <div
            key={banner.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-1 rounded-lg tabular-nums">
                  بنر #{toPersianDigits(index + 1)}
                </span>
                <select
                  value={banner.type}
                  onChange={(e) => {
                    const next = [...tempBanners];
                    next[index] = {
                      ...next[index],
                      type: e.target.value as Banner['type'],
                    };
                    markUpdated(next);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="slider">اسلایدر اصلی</option>
                  <option value="promo_card">کارت تبلیغاتی کنار/میانی</option>
                </select>
                <button
                  type="button"
                  onClick={() => setPreviewBannerId(banner.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 rounded-lg inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش بالا</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={banner.isActive}
                    onChange={(e) => {
                      const next = [...tempBanners];
                      next[index] = { ...next[index], isActive: e.target.checked };
                      markUpdated(next);
                    }}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span>فعال</span>
                </label>

                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
                  title="انتقال به بالا"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === tempBanners.length - 1}
                  onClick={() => handleMove(index, 1)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
                  title="انتقال به پایین"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(index)}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  title="کپی کردن بنر"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {confirmDeleteId === banner.id ? (
                  <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        markUpdated(tempBanners.filter((b) => b.id !== banner.id));
                        setConfirmDeleteId(null);
                      }}
                      className="font-bold text-red-700 dark:text-red-300"
                    >
                      حذف شود
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-slate-500"
                    >
                      لغو
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(banner.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                    title="حذف بنر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان اصلی بنر
                </label>
                <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => {
                    const next = [...tempBanners];
                    next[index] = { ...next[index], title: e.target.value };
                    markUpdated(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  برچسب (Badge)
                </label>
                <input
                  type="text"
                  value={banner.badgeText || ''}
                  onChange={(e) => {
                    const next = [...tempBanners];
                    next[index] = { ...next[index], badgeText: e.target.value };
                    markUpdated(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  مسیر مقصد (یا انتخاب خودرو)
                </label>
                <select
                  value={
                    banner.linkUrl === '#packs' ||
                    banner.linkUrl === '#all' ||
                    cars.some((c) => `#car-${c.id}` === banner.linkUrl)
                      ? banner.linkUrl
                      : 'custom'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') return;
                    const next = [...tempBanners];
                    next[index] = { ...next[index], linkUrl: val };
                    markUpdated(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl mb-1"
                >
                  <option value="#packs">پک‌های سرویس دوره‌ای (#packs)</option>
                  <option value="#all">همه محصولات فروشگاه (#all)</option>
                  {cars.map((car) => (
                    <option key={car.id} value={`#car-${car.id}`}>
                      فیلتر خودرو: {car.name}
                    </option>
                  ))}
                  <option value="custom">لینک دلخواه...</option>
                </select>
                <input
                  type="text"
                  value={banner.linkUrl}
                  onChange={(e) => {
                    const next = [...tempBanners];
                    next[index] = { ...next[index], linkUrl: e.target.value };
                    markUpdated(next);
                  }}
                  dir="ltr"
                  className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-mono text-left"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  زیرعنوان توضیحی بنر
                </label>
                <input
                  type="text"
                  value={banner.subtitle || ''}
                  onChange={(e) => {
                    const next = [...tempBanners];
                    next[index] = { ...next[index], subtitle: e.target.value };
                    markUpdated(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>
            </div>

            {/* تصویر بنر */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex-shrink-0">
                  {banner.imageUrl && (
                    <img
                      src={resolveAssetUrl(banner.imageUrl)}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>آپلود تصویر بنر</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadBannerImage(index, file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={banner.imageUrl}
                    onChange={(e) => {
                      const next = [...tempBanners];
                      next[index] = { ...next[index], imageUrl: e.target.value };
                      markUpdated(next);
                    }}
                    dir="ltr"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                {BANNER_ARCHIVE_PRESETS.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => {
                      const next = [...tempBanners];
                      next[index] = { ...next[index], imageUrl: preset.path };
                      markUpdated(next);
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-700 dark:text-slate-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import {
  Check,
  ImagePlus,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CarModel, Product, ProductCategory } from '../../types';
import {
  calculateDiscountedPrice,
  formatPrice,
  toPersianDigits,
} from '../../utils/shopUtils';
import {
  PRODUCT_ARCHIVE_PRESETS,
  compressImageFile,
} from '../../utils/adminHelpers';
import { resolveAssetUrl } from '../../utils/assetHelper';
import { ProductImage } from '../ProductImage';

interface AdminProductModalProps {
  initialProduct: Product;
  allProducts: Product[];
  cars: CarModel[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

const PRODUCT_TAGS: Product['tags'][number][] = [
  'ویژه',
  'پرفروش',
  'اقتصادی',
  'پیشنهاد شگفت‌انگیز',
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  initialProduct,
  allProducts,
  cars,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<Product>({
    ...initialProduct,
    gallery: initialProduct.gallery || [],
    compatibleCars: initialProduct.compatibleCars || [],
    tags: initialProduct.tags || [],
    packIncludes: initialProduct.packIncludes || [],
    packImages: initialProduct.packImages || [],
    technicalSpecs: initialProduct.technicalSpecs || {},
  });

  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [manualPackItem, setManualPackItem] = useState('');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [customCarsInput, setCustomCarsInput] = useState('');
  const [showSpecs, setShowSpecs] = useState<boolean>(
    Boolean(
      initialProduct.technicalSpecs?.viscosity ||
        initialProduct.technicalSpecs?.apiStandard ||
        initialProduct.technicalSpecs?.volume ||
        initialProduct.technicalSpecs?.filterType
    )
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const catalogSingles = useMemo(
    () => allProducts.filter((p) => !p.isServicePack && p.id !== form.id),
    [allProducts, form.id]
  );

  const toggleSourceItemForPack = (item: Product) => {
    const exists = selectedSourceIds.includes(item.id);
    const nextIds = exists
      ? selectedSourceIds.filter((id) => id !== item.id)
      : [...selectedSourceIds, item.id];
    setSelectedSourceIds(nextIds);

    const selectedProducts = catalogSingles.filter((p) => nextIds.includes(p.id));
    if (selectedProducts.length > 0) {
      const includes = selectedProducts.map((p) => p.title);
      const imgs = selectedProducts
        .map((p) => p.image)
        .filter(Boolean)
        .slice(0, 4);
      const sumPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

      setForm((prev) => ({
        ...prev,
        isServicePack: true,
        category: 'service_pack',
        packIncludes: includes,
        packImages: imgs.length > 0 ? imgs : prev.packImages,
        image: imgs[0] || prev.image,
        price: sumPrice > 0 ? sumPrice : prev.price,
      }));
    }
  };

  const handleAddManualInclude = () => {
    const trimmed = manualPackItem.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      packIncludes: [...(prev.packIncludes || []), trimmed],
    }));
    setManualPackItem('');
  };

  const handleUploadPrimary = async (file: File) => {
    try {
      setUploadError(null);
      const url = await compressImageFile(file, 960, 0.85);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    }
  };

  const handleUploadGalleryImage = async (file: File) => {
    try {
      setUploadError(null);
      const url = await compressImageFile(file, 960, 0.85);
      setForm((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), url],
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطا در آپلود تصویر گالری');
    }
  };

  const handleUploadPackSlot = async (slotIndex: number, file: File) => {
    try {
      setUploadError(null);
      const url = await compressImageFile(file, 720, 0.84);
      setForm((prev) => {
        const next = [...(prev.packImages || [])];
        next[slotIndex] = url;
        return { ...prev, packImages: next.filter(Boolean) };
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطا در آپلود تصویر کلاژ');
    }
  };

  const handlePackSlotUrlChange = (slotIndex: number, val: string) => {
    setForm((prev) => {
      const next = [...(prev.packImages || ['', '', '', ''])];
      while (next.length <= slotIndex) next.push('');
      next[slotIndex] = val;
      return {
        ...prev,
        packImages: next.map((s) => s.trim()).filter(Boolean).slice(0, 4),
      };
    });
  };

  const toggleCarCompatibility = (carName: string) => {
    const baseName = carName.replace(/\(.*?\)/g, '').trim();
    setForm((prev) => {
      const exists = prev.compatibleCars.some(
        (c) => c === carName || c === baseName
      );
      return {
        ...prev,
        compatibleCars: exists
          ? prev.compatibleCars.filter((c) => c !== carName && c !== baseName)
          : [...prev.compatibleCars, baseName || carName],
      };
    });
  };

  const toggleTag = (tag: Product['tags'][number]) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extraCars = customCarsInput
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const mergedCars = Array.from(new Set([...form.compatibleCars, ...extraCars]));
    const cleanPackImages = (form.packImages || []).map((s) => s.trim()).filter(Boolean).slice(0, 4);

    onSave({
      ...form,
      compatibleCars: mergedCars,
      packImages: form.isServicePack ? cleanPackImages : undefined,
      packIncludes: form.isServicePack
        ? (form.packIncludes || []).map((s) => s.trim()).filter(Boolean)
        : undefined,
      image: form.image || cleanPackImages[0] || '',
    });
  };

  const discountedBase = calculateDiscountedPrice(form.price, form.discountPercent);
  const packFinalPreview = form.isServicePack
    ? Math.round(discountedBase * (1 - (form.packDiscountAdditional || 0) / 100))
    : discountedBase;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl z-10 border border-slate-200 dark:border-slate-700 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              {form.isServicePack && <Layers className="w-5 h-5 text-amber-500" />}
              <span>
                {form.id
                  ? `ویرایش ${form.isServicePack ? 'پک سرویس' : 'محصول'}: ${form.title}`
                  : form.isServicePack
                  ? 'ساخت پک سرویس دوره‌ای جدید'
                  : 'افزودن محصول جدید به کاتالوگ'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              تنظیم قیمت، تصویر، گالری، اقلام پک و کلاژ ۴تایی، مشخصات فنی و خودروهای سازگار
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* سوئیچ نوع محصول: تکی یا پک سرویس */}
          <div className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-900 dark:text-amber-100">
              <input
                type="checkbox"
                checked={form.isServicePack}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isServicePack: e.target.checked,
                    category: e.target.checked ? 'service_pack' : prev.category === 'service_pack' ? 'engine_oil' : prev.category,
                    packDiscountAdditional: e.target.checked ? prev.packDiscountAdditional || 10 : prev.packDiscountAdditional,
                  }))
                }
                className="w-4 h-4 accent-amber-500"
              />
              <span>این مورد یک «پک سرویس دوره‌ای کامل» است (نمایش کلاژ چندتایی + لیست اقلام پک)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              <span>موجود و قابل سفارش در سایت</span>
            </label>
          </div>

          {/* اطلاعات پایه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                عنوان کامل محصول / پک سرویس
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثلاً: پک سرویس طلایی تارا و دنا پلاس"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                دسته‌بندی
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as ProductCategory;
                  setForm({
                    ...form,
                    category: cat,
                    isServicePack: cat === 'service_pack' ? true : form.isServicePack,
                  });
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                برند
              </label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                قیمت پایه (تومان)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                درصد تخفیف (٪)
              </label>
              <input
                type="number"
                min={0}
                max={95}
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                موجودی انبار
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left tabular-nums"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                قیمت نهایی فروش به مشتری:
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatPrice(packFinalPreview)}
              </span>
            </div>
          </div>

          {/* برچسب‌های محصول */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              برچسب‌های نمایشی (Tags):
            </label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TAGS.map((tag) => {
                const active = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* بخش ویژه ساخت پک سرویس هیبریدی */}
          {form.isServicePack && (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-black text-sm text-slate-900 dark:text-amber-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>سازنده هیبریدی پک سرویس و کلاژ ۴تایی تصاویر</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    تخفیف مازاد خرید پکی (%):
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.packDiscountAdditional || 0}
                    onChange={(e) =>
                      setForm({ ...form, packDiscountAdditional: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-center"
                  />
                </div>
              </div>

              {/* ۱. انتخاب خودکار از محصولات کاتالوگ */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  انتخاب سریع اقلام از محصولات کاتالوگ (با انتخاب هر کالا، نام و عکس آن به کلاژ پک و جمع قیمت اضافه می‌شود):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                  {catalogSingles.map((item) => {
                    const checked = selectedSourceIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSourceItemForPack(item)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition ${
                          checked
                            ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-500 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={resolveAssetUrl(item.image)}
                          alt={item.title}
                          className="w-8 h-8 rounded object-contain bg-white flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ۲. مدیریت دستی لیست اقلام داخل پک + پیش‌نمایش زنده کلاژ */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 border-t border-amber-200/70 dark:border-amber-800/50">
                <div className="md:col-span-3 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    لیست اقلام داخل پک ({toPersianDigits((form.packIncludes || []).length)} قلم):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualPackItem}
                      onChange={(e) => setManualPackItem(e.target.value)}
                      placeholder="افزودن قلم دستی (مثلاً: فیلتر هوای اصلی سرکان)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualInclude}
                      className="px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold whitespace-nowrap"
                    >
                      + افزودن قلم
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {(form.packIncludes || []).map((inc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <input
                          type="text"
                          value={inc}
                          onChange={(e) => {
                            const next = [...(form.packIncludes || [])];
                            next[idx] = e.target.value;
                            setForm({ ...form, packIncludes: next });
                          }}
                          className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              packIncludes: (form.packIncludes || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* پیش‌نمایش کلاژ زنده ۲×۲ */}
                <div className="md:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                    پیش‌نمایش کلاژ کارت پک در سایت
                  </span>
                  <div className="w-40 h-40">
                    <ProductImage
                      src={form.image}
                      packImages={form.packImages}
                      alt={form.title || 'پک سرویس'}
                      category="service_pack"
                      title={form.title}
                      brand={form.brand}
                    />
                  </div>
                </div>
              </div>

              {/* ۳. تنظیم ۴ اسلات تصویر کلاژ پک */}
              <div className="space-y-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/50">
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  تصاویر کلاژ ۴تایی پک (آپلود یا آدرس هر اسلات):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const slotVal = (form.packImages || [])[slotIdx] || '';
                    return (
                      <div
                        key={slotIdx}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {slotVal ? (
                            <img
                              src={resolveAssetUrl(slotVal)}
                              alt={`قلم ${slotIdx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              #{toPersianDigits(slotIdx + 1)}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={slotVal}
                          onChange={(e) => handlePackSlotUrlChange(slotIdx, e.target.value)}
                          dir="ltr"
                          placeholder={`آدرس تصویر ${slotIdx + 1}`}
                          className="flex-1 min-w-0 px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-left"
                        />
                        <label className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadPackSlot(slotIdx, file);
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* تصویر اصلی + گالری تصاویر */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                تصویر اصلی و گالری تصاویر محصول
              </label>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="text-[11px] text-red-600 dark:text-red-400 font-bold"
                >
                  حذف تصویر اصلی
                </button>
              )}
            </div>

            {uploadError && (
              <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{uploadError}</p>
            )}

            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                {form.image ? (
                  <img
                    src={resolveAssetUrl(form.image)}
                    alt="پیش‌نمایش"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">بدون تصویر</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>آپلود تصویر اصلی</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPrimary(file);
                      }}
                    />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold cursor-pointer transition">
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>+ افزودن به گالری</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadGalleryImage(file);
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  dir="ltr"
                  placeholder="assets/images/products/... یا https://..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                />
              </div>
            </div>

            {/* پیش‌نمایش و افزودن لینک گالری */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  dir="ltr"
                  placeholder="آدرس تصویر اضافی برای گالری محصول..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-left text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!galleryUrlInput.trim()) return;
                    setForm((prev) => ({
                      ...prev,
                      gallery: [...(prev.gallery || []), galleryUrlInput.trim()],
                    }));
                    setGalleryUrlInput('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold whitespace-nowrap"
                >
                  افزودن لینک گالری
                </button>
              </div>

              {form.gallery && form.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.gallery.map((gImg, idx) => (
                    <div
                      key={`${gImg}-${idx}`}
                      className="relative w-14 h-14 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1"
                    >
                      <img
                        src={resolveAssetUrl(gImg)}
                        alt={`گالری ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            gallery: form.gallery.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* آرشیو سریع */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1.5">
                انتخاب سریع از آرشیو تصاویر آماده محصولات:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {PRODUCT_ARCHIVE_PRESETS.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setForm({ ...form, image: preset.path })}
                    className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* خودروهای سازگار */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              خودروهای سازگار (کلیک برای انتخاب از لیست خودروهای سایت):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {cars.map((car) => {
                const baseName = car.name.replace(/\(.*?\)/g, '').trim();
                const isSelected = form.compatibleCars.some(
                  (c) => c === car.name || c === baseName
                );
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => toggleCarCompatibility(car.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {car.name}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customCarsInput}
              onChange={(e) => setCustomCarsInput(e.target.value)}
              placeholder="افزودن سایر خودروهای متفرقه (با کاما جدا کنید، مثال: پژو ۴۰۵، رانا پلاس)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
            />
          </div>

          {/* مشخصات فنی تاشو */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSpecs((s) => !s)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200"
            >
              <span>مشخصات فنی تخصصی (گرانروی، استاندارد API، حجم، گارانتی)</span>
              <Plus className={`w-4 h-4 transition-transform ${showSpecs ? 'rotate-45' : ''}`} />
            </button>
            {showSpecs && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white dark:bg-slate-900">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    گرانروی (Viscosity)
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.viscosity || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: { ...form.technicalSpecs, viscosity: e.target.value },
                      })
                    }
                    placeholder="10W-40 یا 5W-30"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    استاندارد API / ACEA
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.apiStandard || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: { ...form.technicalSpecs, apiStandard: e.target.value },
                      })
                    }
                    placeholder="API SN/CF"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    حجم / وزن
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.volume || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: { ...form.technicalSpecs, volume: e.target.value },
                      })
                    }
                    placeholder="۴ لیتر"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    نوع فیلتر / ساختار
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.filterType || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: { ...form.technicalSpecs, filterType: e.target.value },
                      })
                    }
                    placeholder="رزوه‌دار پیچی یا المنتی"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    گارانتی اصالت
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.warranty || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: { ...form.technicalSpecs, warranty: e.target.value },
                      })
                    }
                    placeholder="ضمانت اصالت نوین فیلتر"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    کشور / کارخانه سازنده
                  </label>
                  <input
                    type="text"
                    value={form.technicalSpecs.countryOfOrigin || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        technicalSpecs: {
                          ...form.technicalSpecs,
                          countryOfOrigin: e.target.value,
                        },
                      })
                    }
                    placeholder="ایران (تحت لیسانس)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* توضیحات */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات فنی و کاربرد محصول
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره اطلاعات {form.isServicePack ? 'پک سرویس' : 'محصول'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

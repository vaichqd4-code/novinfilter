import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Car,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CarModel } from '../../types';
import { resolveAssetUrl } from '../../utils/assetHelper';
import { toPersianDigits } from '../../utils/shopUtils';
import { CAR_ARCHIVE_PRESETS, compressImageFile } from '../../utils/adminHelpers';

interface AdminVehiclesTabProps {
  cars: CarModel[];
  onAddCar: (car: Omit<CarModel, 'id'> & { id?: string }) => void;
  onUpdateCar: (id: string, updates: Partial<CarModel>) => void;
  onDeleteCar: (id: string) => void;
  onReorderCars: (cars: CarModel[]) => void;
}

const BRAND_GROUPS = ['ایران‌خودرو', 'سایپا', 'رنو / پارس‌خودرو', 'خودروهای چینی / مونتاژی', 'سایر برندها'];

export const AdminVehiclesTab: React.FC<AdminVehiclesTabProps> = ({
  cars,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  onReorderCars,
}) => {
  const [search, setSearch] = useState('');
  const [editingCar, setEditingCar] = useState<(Omit<CarModel, 'id'> & { id?: string; isNew?: boolean }) | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filtered = cars.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.brandGroup || '').toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= cars.length) return;
    const next = [...cars];
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    onReorderCars(next);
  };

  const handleOpenAdd = () => {
    setUploadError(null);
    setEditingCar({
      isNew: true,
      id: '',
      name: '',
      brandGroup: 'ایران‌خودرو',
      imageUrl: 'assets/images/cars/peugeot-206.jpg',
      isActive: true,
    });
  };

  const handleOpenEdit = (car: CarModel) => {
    setUploadError(null);
    setEditingCar({ ...car, isNew: false });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar || !editingCar.name.trim()) return;
    if (editingCar.isNew) {
      onAddCar({
        id: editingCar.id?.trim() || undefined,
        name: editingCar.name.trim(),
        brandGroup: editingCar.brandGroup || 'ایران‌خودرو',
        imageUrl: editingCar.imageUrl?.trim() || '',
        isActive: editingCar.isActive,
      });
    } else if (editingCar.id) {
      onUpdateCar(editingCar.id, {
        name: editingCar.name.trim(),
        brandGroup: editingCar.brandGroup || 'ایران‌خودرو',
        imageUrl: editingCar.imageUrl?.trim() || '',
        isActive: editingCar.isActive,
      });
    }
    setEditingCar(null);
  };

  const handleCarImageUpload = async (file: File) => {
    try {
      setUploadError(null);
      const dataUrl = await compressImageFile(file, 640, 0.85);
      setEditingCar((prev) => (prev ? { ...prev, imageUrl: dataUrl } : prev));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطا در آپلود تصویر خودرو');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>مدیریت لیست خودروها و تصاویر دکمه‌های فیلتر ({toPersianDigits(cars.length)})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            هر تغییری در این لیست بلافاصله در بخش «انتخاب خودرو» صفحه اصلی و فرم ساخت پک سرویس اعمال می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن خودروی جدید</span>
        </button>
      </div>

      {/* جستجو */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام خودرو یا گروه برند..."
          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* لیست خودروها */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
            <tr>
              <th className="p-3.5 w-20">تصویر</th>
              <th className="p-3.5">نام خودرو</th>
              <th className="p-3.5">گروه / برند</th>
              <th className="p-3.5">شناسه لینک بنر</th>
              <th className="p-3.5">وضعیت نمایش</th>
              <th className="p-3.5 text-center">چیدمان و عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((car) => {
              const actualIndex = cars.findIndex((c) => c.id === car.id);
              const isDeleting = confirmDeleteId === car.id;
              return (
                <tr key={car.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      {car.imageUrl ? (
                        <img
                          src={resolveAssetUrl(car.imageUrl)}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{car.name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{car.brandGroup || 'عمومی'}</td>
                  <td className="p-3">
                    <code
                      dir="ltr"
                      className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                    >
                      #car-{car.id}
                    </code>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => onUpdateCar(car.id, { isActive: !car.isActive })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                        car.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {car.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{car.isActive ? 'فعال در سایت' : 'مخفی'}</span>
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {!search && (
                        <>
                          <button
                            type="button"
                            disabled={actualIndex === 0}
                            onClick={() => handleMove(actualIndex, -1)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={actualIndex === cars.length - 1}
                            onClick={() => handleMove(actualIndex, 1)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(car)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                        title="ویرایش خودرو"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {isDeleting ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCar(car.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[11px] font-bold text-red-700 dark:text-red-300 hover:underline whitespace-nowrap"
                          >
                            تایید حذف
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(car.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                          title="حذف خودرو"
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

      {/* مودال افزودن/ویرایش خودرو */}
      {editingCar && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => setEditingCar(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {editingCar.isNew ? 'افزودن خودروی جدید به فیلتر فروشگاه' : `ویرایش خودرو: ${editingCar.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام خودرو (نمایش به مشتری)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCar.name}
                    onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                    placeholder="مثلاً: پژو ۲۰۶ و ۲۰۷ (TU5)"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    گروه سازنده / برند
                  </label>
                  <select
                    value={editingCar.brandGroup || 'ایران‌خودرو'}
                    onChange={(e) => setEditingCar({ ...editingCar, brandGroup: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                  >
                    {BRAND_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingCar.isNew && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    شناسه انگلیسی (اختیاری برای لینک بنر، مثال: peugeot-405)
                  </label>
                  <input
                    type="text"
                    value={editingCar.id || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, id: e.target.value })}
                    dir="ltr"
                    placeholder="به صورت خودکار یا مثال: samand-soren"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-left"
                  />
                </div>
              )}

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  تصویر خودرو (آپلود یا انتخاب از آرشیو خودروها)
                </label>

                {uploadError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{uploadError}</p>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex-shrink-0">
                    {editingCar.imageUrl ? (
                      <img
                        src={resolveAssetUrl(editingCar.imageUrl)}
                        alt={editingCar.name || 'خودرو'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                        بدون عکس
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>آپلود تصویر از دستگاه</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCarImageUpload(file);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingCar.imageUrl || ''}
                      onChange={(e) => setEditingCar({ ...editingCar, imageUrl: e.target.value })}
                      dir="ltr"
                      placeholder="assets/images/cars/..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-mono text-left"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {CAR_ARCHIVE_PRESETS.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setEditingCar({ ...editingCar, imageUrl: preset.path })}
                      className="px-2 py-1 text-[10px] bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={editingCar.isActive}
                  onChange={(e) => setEditingCar({ ...editingCar, isActive: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>نمایش این خودرو در دکمه‌های انتخاب خودروی فروشگاه</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره خودرو</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

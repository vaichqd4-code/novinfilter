import React from 'react';
import { Car, Check, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { resolveAssetUrl } from '../utils/assetHelper';

export const VehicleQuickFilter: React.FC = () => {
  const { cars, activeCarFilter, setActiveCarFilter } = useShop();

  const activeCars = cars.filter((c) => c.isActive);
  const filterItems = [
    { id: 'all', name: 'همه خودروها', imageUrl: undefined },
    ...activeCars,
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl flex-shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                انتخاب سریع بر اساس خودروی شما
              </h3>
              <p className="text-xs text-slate-500">
                فیلترها و روغن‌های استاندارد متناسب با خودروی خود را انتخاب کنید
              </p>
            </div>
          </div>

          {activeCarFilter !== 'all' && (
            <button
              onClick={() => setActiveCarFilter('all')}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>نمایش همه خودروها</span>
            </button>
          )}
        </div>

        {/* دکمه‌های افقی انتخاب خودرو همراه با تصویر واقعی هر خودرو */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 mobile-x-scroll">
          {filterItems.map((car) => {
            const isSelected =
              activeCarFilter === car.name || (car.id === 'all' && activeCarFilter === 'all');
            return (
              <button
                key={car.id}
                onClick={() => setActiveCarFilter(car.id === 'all' ? 'all' : car.name)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-150 border flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {car.imageUrl ? (
                  <div
                    className={`w-12 h-8 sm:w-14 sm:h-9 rounded-lg overflow-hidden flex-shrink-0 border ${
                      isSelected ? 'border-white/40 bg-white/10' : 'border-slate-200/80 bg-slate-200'
                    }`}
                  >
                    <img
                      src={resolveAssetUrl(car.imageUrl)}
                      alt={car.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                  </div>
                )}

                <span>{car.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

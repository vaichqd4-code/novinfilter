import React from 'react';
import { Car, Check, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { POPULAR_CARS } from '../data/initialData';

export const VehicleQuickFilter: React.FC = () => {
  const { activeCarFilter, setActiveCarFilter } = useShop();

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                انتخاب سریع بر اساس خودروی شما
              </h3>
              <p className="text-xs text-slate-500">
                فیلترها و روغن‌های استاندارد و دقیق متناسب با پیشرانه خودروی خود را انتخاب کنید
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

        {/* دکمه‌های افقی انتخاب خودرو با اسکرول نرم در موبایل */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          {POPULAR_CARS.map((car) => {
            const isSelected = activeCarFilter === car.name || (car.id === 'all' && activeCarFilter === 'all');
            return (
              <button
                key={car.id}
                onClick={() => setActiveCarFilter(car.id === 'all' ? 'all' : car.name)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{car.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

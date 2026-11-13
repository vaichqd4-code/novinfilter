import React, { useState } from 'react';
import { ProductCategory } from '../types';
import { resolveAssetUrl } from '../utils/assetHelper';

interface ProductImageProps {
  src?: string;
  packImages?: string[];
  alt: string;
  category: ProductCategory;
  title: string;
  viscosity?: string;
  brand?: string;
  className?: string;
  compact?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  packImages,
  alt,
  category,
  title,
  viscosity,
  brand,
  className = 'w-full h-full object-contain',
  compact = false,
}) => {
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({});

  const markFailed = (url: string) => {
    setFailedMap((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  };

  // ۱. نمایش کلاژ چندتایی اقلام واقعی برای پک‌های سرویس دوره‌ای
  if (packImages && packImages.length >= 2) {
    const validItems = packImages
      .map((item) => resolveAssetUrl(item))
      .filter((url) => url && !url.includes('unsplash.com') && !failedMap[url])
      .slice(0, 4);

    if (validItems.length >= 2) {
      const gridLayout =
        validItems.length === 2
          ? 'grid-cols-2 grid-rows-1'
          : 'grid-cols-2 grid-rows-2';

      return (
        <div
          className={`w-full h-full grid ${gridLayout} ${
            compact ? 'gap-0.5' : 'gap-1.5 sm:gap-2'
          }`}
        >
          {validItems.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className={`bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden shadow-2xs ${
                compact ? 'rounded-md p-0.5' : 'rounded-xl p-1 sm:p-1.5'
              } ${
                validItems.length === 3 && idx === 0 ? 'row-span-2' : ''
              }`}
            >
              <img
                src={imgUrl}
                alt={`${alt} - قلم ${idx + 1}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => markFailed(imgUrl)}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      );
    }
  }

  // ۲. نمایش عکس واقعی تک‌محصول
  const resolvedSrc = resolveAssetUrl(src);
  if (resolvedSrc && !failedMap[resolvedSrc] && !resolvedSrc.includes('unsplash.com')) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => markFailed(resolvedSrc)}
        className={`${className} transition-transform duration-300 md:group-hover:scale-105`}
      />
    );
  }

  // ۳. تصویر جایگزین برداری اختصاصی بر اساس دسته‌بندی (در صورت نبود تصویر)
  return (
    <div className={`w-full h-full flex items-center justify-center p-2 relative select-none ${className}`}>
      {category === 'service_pack' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="packBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0077E6" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="goldDrop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="canisterGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>

          <rect x="15" y="15" width="170" height="170" rx="24" fill="url(#packBg)" opacity="0.08" />

          <g transform="translate(30, 40)">
            <rect x="15" y="25" width="60" height="90" rx="8" fill="url(#canisterGrad)" />
            <path d="M 15 45 C 5 45, 5 80, 15 80" fill="none" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
            <rect x="52" y="16" width="18" height="12" rx="3" fill="#F59E0B" />
            <rect x="22" y="55" width="46" height="42" rx="4" fill="#FFFFFF" />
            <text x="45" y="72" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0077E6">NOVIN</text>
            <text x="45" y="85" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#D97706">10W-40</text>
          </g>

          <g transform="translate(100, 50)">
            <rect x="10" y="20" width="65" height="50" rx="6" fill="#F97316" />
            <rect x="16" y="25" width="53" height="40" rx="3" fill="#FEF08A" />
            <line x1="26" y1="25" x2="26" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="36" y1="25" x2="36" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="46" y1="25" x2="46" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="56" y1="25" x2="56" y2="65" stroke="#CA8A04" strokeWidth="2" />
          </g>

          <g transform="translate(95, 88)">
            <rect x="15" y="15" width="48" height="55" rx="6" fill="#0F172A" />
            <ellipse cx="39" cy="15" rx="24" ry="7" fill="#64748B" />
            <ellipse cx="39" cy="15" rx="14" ry="4" fill="#334155" />
            <circle cx="39" cy="15" r="4" fill="#0F172A" />
            <rect x="20" y="32" width="38" height="25" rx="3" fill="#0284C7" />
            <text x="39" y="47" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">SERKAN</text>
          </g>

          <g transform="translate(20, 140)">
            <rect x="0" y="0" width="70" height="24" rx="12" fill="url(#goldDrop)" />
            <text x="35" y="16" fontSize="10" fontWeight="900" textAnchor="middle" fill="#0F172A">پک کامل</text>
          </g>
        </svg>
      )}

      {category === 'engine_oil' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="oilCan" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="goldShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="105" r="75" fill="#E0F2FE" opacity="0.6" />
          <rect x="55" y="45" width="90" height="120" rx="14" fill="url(#oilCan)" />
          <path d="M 55 70 C 35 70, 35 120, 55 120" fill="none" stroke="#0284C7" strokeWidth="12" strokeLinecap="round" />
          <rect x="110" y="32" width="28" height="16" rx="4" fill="url(#goldShine)" />
          <rect x="66" y="75" width="68" height="72" rx="8" fill="#FFFFFF" />
          <text x="100" y="112" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0F172A">
            {brand || 'بهران'}
          </text>
          <text x="100" y="128" fontSize="11" fontWeight="900" textAnchor="middle" fill="#0284C7">
            {viscosity || '10W-40'}
          </text>
        </svg>
      )}

      {category === 'oil_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <circle cx="100" cy="105" r="70" fill="#F1F5F9" />
          <rect x="60" y="65" width="80" height="95" rx="8" fill="#1E293B" />
          <ellipse cx="100" cy="65" rx="40" ry="14" fill="#64748B" />
          <rect x="68" y="95" width="64" height="42" rx="4" fill="#0284C7" />
          <text x="100" y="115" fontSize="10" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
            {brand || 'سرکان'}
          </text>
        </svg>
      )}

      {category === 'air_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <rect x="25" y="45" width="150" height="110" rx="14" fill="#EA580C" />
          <rect x="38" y="58" width="124" height="84" rx="8" fill="#FEF08A" />
          <rect x="65" y="88" width="70" height="25" rx="6" fill="#0F172A" opacity="0.9" />
          <text x="100" y="104" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">
            {title ? 'فیلتر هوا' : 'نوین فیلتر'}
          </text>
        </svg>
      )}

      {category === 'cabin_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <rect x="30" y="45" width="140" height="110" rx="10" fill="#334155" />
          <rect x="40" y="55" width="120" height="90" rx="6" fill="#1E293B" />
          <rect x="60" y="85" width="80" height="30" rx="6" fill="#0077E6" />
          <text x="100" y="103" fontSize="9" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
            کربن فعال نانو
          </text>
        </svg>
      )}

      {category === 'gearbox_oil' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <rect x="68" y="55" width="64" height="110" rx="10" fill="#4338CA" />
          <rect x="88" y="32" width="24" height="25" rx="3" fill="#4338CA" />
          <rect x="76" y="80" width="48" height="60" rx="6" fill="#FFFFFF" />
          <text x="100" y="105" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#312E81">
            واسکازین
          </text>
          <text x="100" y="120" fontSize="10" fontWeight="900" textAnchor="middle" fill="#0077E6">
            {viscosity || '75W-80'}
          </text>
        </svg>
      )}
    </div>
  );
};

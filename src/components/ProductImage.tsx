import React, { useState } from 'react';
import { ProductCategory } from '../types';

interface ProductImageProps {
  src?: string;
  alt: string;
  category: ProductCategory;
  title: string;
  viscosity?: string;
  brand?: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  title,
  viscosity,
  brand,
  className = 'w-full h-full object-contain',
}) => {
  const [hasError, setHasError] = useState(false);

  // If image URL is local asset (e.g. /assets/...) or loaded successfully, try showing it
  if (src && !hasError && !src.includes('unsplash.com')) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
      />
    );
  }

  // Fallback vector illustrations tailored to each automotive product category:
  // Rendered with high precision SVG so they load instantly with zero external dependencies
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

          {/* Background Badge Container */}
          <rect x="15" y="15" width="170" height="170" rx="24" fill="url(#packBg)" opacity="0.08" />

          {/* Oil Canister (Back Left) */}
          <g transform="translate(30, 40)">
            <rect x="15" y="25" width="60" height="90" rx="8" fill="url(#canisterGrad)" />
            {/* Canister handle */}
            <path d="M 15 45 C 5 45, 5 80, 15 80" fill="none" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
            {/* Canister Cap */}
            <rect x="52" y="16" width="18" height="12" rx="3" fill="#F59E0B" />
            <rect x="22" y="55" width="46" height="42" rx="4" fill="#FFFFFF" />
            <text x="45" y="72" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0077E6">NOVIN</text>
            <text x="45" y="85" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#D97706">10W-40</text>
          </g>

          {/* Air Filter (Back Right) */}
          <g transform="translate(100, 50)">
            <rect x="10" y="20" width="65" height="50" rx="6" fill="#F97316" />
            <rect x="16" y="25" width="53" height="40" rx="3" fill="#FEF08A" />
            {/* Pleats */}
            <line x1="26" y1="25" x2="26" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="36" y1="25" x2="36" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="46" y1="25" x2="46" y2="65" stroke="#CA8A04" strokeWidth="2" />
            <line x1="56" y1="25" x2="56" y2="65" stroke="#CA8A04" strokeWidth="2" />
          </g>

          {/* Oil Filter (Front Center) */}
          <g transform="translate(95, 88)">
            <rect x="15" y="15" width="48" height="55" rx="6" fill="#0F172A" />
            <ellipse cx="39" cy="15" rx="24" ry="7" fill="#64748B" />
            <ellipse cx="39" cy="15" rx="14" ry="4" fill="#334155" />
            <circle cx="39" cy="15" r="4" fill="#0F172A" />
            <circle cx="25" cy="15" r="2" fill="#E2E8F0" />
            <circle cx="53" cy="15" r="2" fill="#E2E8F0" />
            <rect x="20" y="32" width="38" height="25" rx="3" fill="#0284C7" />
            <text x="39" y="47" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">SERKAN</text>
          </g>

          {/* Golden Badge: "پک کامل" */}
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

          {/* Background circle accent */}
          <circle cx="100" cy="105" r="75" fill="#E0F2FE" opacity="0.6" />

          {/* Main Canister Body */}
          <rect x="55" y="45" width="90" height="120" rx="14" fill="url(#oilCan)" />

          {/* Canister Handle */}
          <path d="M 55 70 C 35 70, 35 120, 55 120" fill="none" stroke="#0284C7" strokeWidth="12" strokeLinecap="round" />
          <path d="M 55 70 C 38 70, 38 120, 55 120" fill="none" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />

          {/* Canister Cap */}
          <rect x="110" y="32" width="28" height="16" rx="4" fill="url(#goldShine)" />
          <line x1="114" y1="34" x2="114" y2="46" stroke="#92400E" strokeWidth="2" />
          <line x1="120" y1="34" x2="120" y2="46" stroke="#92400E" strokeWidth="2" />
          <line x1="126" y1="34" x2="126" y2="46" stroke="#92400E" strokeWidth="2" />
          <line x1="132" y1="34" x2="132" y2="46" stroke="#92400E" strokeWidth="2" />

          {/* White Front Label */}
          <rect x="66" y="75" width="68" height="72" rx="8" fill="#FFFFFF" />

          {/* Oil Drop Logo on Label */}
          <path d="M 100 84 C 95 92, 90 98, 90 104 C 90 110, 95 114, 100 114 C 105 114, 110 110, 110 104 C 110 98, 105 92, 100 84 Z" fill="url(#goldShine)" />

          {/* Viscosity & Brand text on label */}
          <text x="100" y="125" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0F172A">
            {brand || 'بهران'}
          </text>
          <text x="100" y="137" fontSize="11" fontWeight="900" textAnchor="middle" fill="#0284C7">
            {viscosity || '10W-40'}
          </text>
          <rect x="74" y="140" width="52" height="4" rx="2" fill="#F59E0B" />

          {/* 4 Liters Badge */}
          <g transform="translate(115, 145)">
            <circle cx="16" cy="16" r="14" fill="#0F172A" />
            <text x="16" y="20" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#FBBF24">۴ لیتری</text>
          </g>
        </svg>
      )}

      {category === 'oil_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="filterMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="40%" stopColor="#475569" />
              <stop offset="70%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="filterTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Background circle accent */}
          <circle cx="100" cy="105" r="70" fill="#F1F5F9" />

          {/* Cylindrical Body */}
          <rect x="60" y="65" width="80" height="95" rx="8" fill="url(#filterMetal)" />

          {/* Top Plate with Holes */}
          <ellipse cx="100" cy="65" rx="40" ry="14" fill="url(#filterTop)" />
          <ellipse cx="100" cy="65" rx="22" ry="7" fill="#1E293B" />
          <ellipse cx="100" cy="65" rx="10" ry="3.5" fill="#000000" />

          {/* Oil Flow Inlets */}
          <circle cx="75" cy="65" r="3.5" fill="#0F172A" />
          <circle cx="125" cy="65" r="3.5" fill="#0F172A" />
          <circle cx="85" cy="60" r="3.5" fill="#0F172A" />
          <circle cx="115" cy="60" r="3.5" fill="#0F172A" />
          <circle cx="85" cy="70" r="3.5" fill="#0F172A" />
          <circle cx="115" cy="70" r="3.5" fill="#0F172A" />

          {/* Filter Label on body */}
          <rect x="68" y="95" width="64" height="42" rx="4" fill="#0284C7" />
          <text x="100" y="112" fontSize="10" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
            {brand || 'سرکان'}
          </text>
          <text x="100" y="125" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#FDE047">
            فیلتر روغن اصلی
          </text>

          {/* Flutes at bottom */}
          <path d="M 60 152 Q 100 162 140 152 L 140 160 Q 100 170 60 160 Z" fill="#0F172A" />
        </svg>
      )}

      {category === 'air_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="foamFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="paperPleats" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>

          <rect x="25" y="45" width="150" height="110" rx="14" fill="url(#foamFrame)" />
          <rect x="38" y="58" width="124" height="84" rx="8" fill="url(#paperPleats)" />

          {/* Pleated folds */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={48 + i * 9}
              y1={58}
              x2={48 + i * 9}
              y2={142}
              stroke="#A16207"
              strokeWidth="2.5"
            />
          ))}

          {/* Center Brand Badge */}
          <rect x="65" y="88" width="70" height="25" rx="6" fill="#0F172A" opacity="0.9" />
          <text x="100" y="104" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">
            نوین فیلتر
          </text>
        </svg>
      )}

      {category === 'cabin_filter' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <rect x="30" y="45" width="140" height="110" rx="10" fill="#334155" />
          <rect x="40" y="55" width="120" height="90" rx="6" fill="#1E293B" />

          {/* Carbon Pleats */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={i}
              x1={50 + i * 10}
              y1={55}
              x2={50 + i * 10}
              y2={145}
              stroke="#64748B"
              strokeWidth="2.5"
            />
          ))}

          {/* Activated Carbon Nano Badge */}
          <rect x="60" y="85" width="80" height="30" rx="6" fill="#0077E6" />
          <text x="100" y="100" fontSize="9" fontWeight="900" textAnchor="middle" fill="#FFFFFF">
            کربن فعال نانو
          </text>
          <text x="100" y="110" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#BAE6FD">
            تصفیه هوای اتاق
          </text>
        </svg>
      )}

      {category === 'gearbox_oil' && (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="gearBottle" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
          </defs>

          {/* Tall Gearbox Bottle */}
          <rect x="68" y="55" width="64" height="110" rx="10" fill="url(#gearBottle)" />
          {/* Nozzle Neck */}
          <rect x="88" y="32" width="24" height="25" rx="3" fill="#4338CA" />
          <rect x="92" y="24" width="16" height="10" rx="2" fill="#F59E0B" />

          {/* Label */}
          <rect x="76" y="80" width="48" height="60" rx="6" fill="#FFFFFF" />
          <text x="100" y="98" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#312E81">
            واسکازین
          </text>
          <text x="100" y="112" fontSize="10" fontWeight="900" textAnchor="middle" fill="#0077E6">
            75W-80
          </text>
          <text x="100" y="128" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#F59E0B">
            بهران سمند
          </text>
        </svg>
      )}
    </div>
  );
};

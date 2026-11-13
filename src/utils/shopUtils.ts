import { CartItem, Product, ProductCategory } from '../types';

/**
 * تبدیل ارقام انگلیسی به فارسی
 */
export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  const str = n.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * تبدیل ارقام فارسی و عربی به انگلیسی برای اعتبارسنجی و فرم‌ها
 */
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * فرمت‌بندی قیمت به تومان با ارقام فارسی و جداکننده هزارگان
 */
export function formatPrice(price: number): string {
  if (isNaN(price)) return '۰ تومان';
  const formatted = Math.round(price).toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

/**
 * محاسبه قیمت بعد از تخفیف
 */
export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  const discount = (price * Math.min(100, discountPercent)) / 100;
  return Math.round(price - discount);
}

/**
 * محاسبه قیمت هر آیتم بر اساس تکی یا پکی بودن
 */
export function getItemUnitPrice(item: CartItem): number {
  const baseDiscounted = calculateDiscountedPrice(item.product.price, item.product.discountPercent);
  if (item.purchaseMode === 'pack') {
    // تخفیف اضافی پک سرویس (۱۰٪ تخفیف بیشتر در حالت پکی)
    const extraPackDiscount = item.product.packDiscountAdditional || 10;
    return Math.round(baseDiscounted * (1 - extraPackDiscount / 100));
  }
  return baseDiscounted;
}

/**
 * محاسبه مبالغ کل سبد خرید
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalTotal: number;
  totalQuantity: number;
} {
  let subtotal = 0;
  let finalTotal = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const rawTotal = item.product.price * item.quantity;
    const unitPrice = getItemUnitPrice(item);
    const itemTotal = unitPrice * item.quantity;

    subtotal += rawTotal;
    finalTotal += itemTotal;
    totalQuantity += item.quantity;
  }

  const discount = Math.max(0, subtotal - finalTotal);
  // ارسال رایگان برای خریدهای بالای ۲ میلیون تومان، در غیر اینصورت هزینه ارسال استاندارد ۷۵,۰۰۰ تومان
  const shippingFee = finalTotal >= 2000000 || finalTotal === 0 ? 0 : 75000;
  const grandTotal = finalTotal === 0 ? 0 : finalTotal + shippingFee;

  return {
    subtotal,
    discount,
    shippingFee,
    finalTotal: grandTotal,
    totalQuantity,
  };
}

/**
 * اعتبارسنجی شماره همراه ایرانی
 * فرمت‌های معتبر: 0912..., 09..., +989..., 00989...
 */
export function validateIranianPhone(rawPhone: string): { isValid: boolean; message?: string; cleanPhone?: string } {
  if (!rawPhone || rawPhone.trim() === '') {
    return { isValid: false, message: 'شماره تلفن همراه را وارد کنید' };
  }
  const clean = toEnglishDigits(rawPhone).replace(/[\s-]/g, '');
  const regex = /^(?:\+98|0098|0)?9\d{9}$/;
  if (!regex.test(clean)) {
    return { isValid: false, message: 'شماره همراه نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' };
  }
  let normalized = clean;
  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('0098')) {
    normalized = '0' + normalized.substring(4);
  } else if (!normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }
  return { isValid: true, cleanPhone: normalized };
}

/**
 * اعتبارسنجی کد پستی ده‌رقمی ایران
 */
export function validatePostalCode(rawCode: string): { isValid: boolean; message?: string; cleanCode?: string } {
  if (!rawCode || rawCode.trim() === '') {
    return { isValid: false, message: 'کد پستی ۱۰ رقمی الزامی است' };
  }
  const clean = toEnglishDigits(rawCode).replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(clean)) {
    return { isValid: false, message: 'کد پستی باید دقیقاً ۱۰ رقم بدون خط تیره باشد' };
  }
  return { isValid: true, cleanCode: clean };
}

/**
 * فیلتر و جستجوی محصولات
 */
export function filterProducts(
  products: Product[],
  options: {
    searchQuery?: string;
    category?: ProductCategory | 'all';
    carModel?: string;
    onlyInStock?: boolean;
    onlyPacks?: boolean;
    tag?: string;
  }
): Product[] {
  const { searchQuery, category, carModel, onlyInStock, onlyPacks, tag } = options;

  return products.filter((product) => {
    // دسته‌بندی
    if (category && category !== 'all' && product.category !== category) {
      return false;
    }

    // موجودی
    if (onlyInStock && (!product.isAvailable || product.stock <= 0)) {
      return false;
    }

    // پک اقتصادی
    if (onlyPacks && !product.isServicePack) {
      return false;
    }

    // تگ
    if (tag && !product.tags.includes(tag as any)) {
      return false;
    }

    // فیلتر خودرو
    if (carModel && carModel !== 'all') {
      const normalizedTarget = toEnglishDigits(carModel).toLowerCase().trim();
      const baseName = normalizedTarget.replace(/\(.*?\)/g, '').trim();
      const tokens = baseName
        .split(/[،,/|\s]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !['پژو', 'مدل', 'خودرو', 'تمام', 'و'].includes(t));

      const matchCar =
        product.compatibleCars.some((car) => {
          const c = toEnglishDigits(car).toLowerCase();
          return c.includes(normalizedTarget) || (baseName && c.includes(baseName)) || tokens.some((tok) => c.includes(tok));
        }) ||
        Boolean(
          product.technicalSpecs.suitableCars &&
            (() => {
              const s = toEnglishDigits(product.technicalSpecs.suitableCars).toLowerCase();
              return s.includes(normalizedTarget) || (baseName && s.includes(baseName)) || tokens.some((tok) => s.includes(tok));
            })()
        );
      if (!matchCar) return false;
    }

    // جستجوی متنی (نام، برند، خودروهای سازگار، ویسکوزیته)
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = product.title.toLowerCase().includes(q);
      const inBrand = product.brand.toLowerCase().includes(q);
      const inCars = product.compatibleCars.some((c) => c.toLowerCase().includes(q));
      const inViscosity = (product.technicalSpecs.viscosity || '').toLowerCase().includes(q);
      const inFilterType = (product.technicalSpecs.filterType || '').toLowerCase().includes(q);
      const inDesc = product.description.toLowerCase().includes(q);

      if (!inTitle && !inBrand && !inCars && !inViscosity && !inFilterType && !inDesc) {
        return false;
      }
    }

    return true;
  });
}

/**
 * تولید شماره سفارش یکتا
 */
export function generateOrderNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const yearStr = (now.getFullYear() - 621).toString().slice(-2); // تقریبی سال شمسی
  return `NF-${yearStr}${now.getMonth() + 1}-${randomSuffix}`;
}

/**
 * ترجمه نام دسته‌بندی‌ها به فارسی
 */
export function getCategoryTitle(category: ProductCategory | 'all'): string {
  switch (category) {
    case 'engine_oil':
      return 'روغن موتور';
    case 'oil_filter':
      return 'فیلتر روغن';
    case 'air_filter':
      return 'فیلتر هوا';
    case 'cabin_filter':
      return 'فیلتر اتاق';
    case 'gearbox_oil':
      return 'روغن گیربکس';
    case 'service_pack':
      return 'پک‌های سرویس اقتصادی';
    case 'all':
    default:
      return 'همه دسته‌بندی‌ها';
  }
}

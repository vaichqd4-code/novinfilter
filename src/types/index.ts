export type ProductCategory = 
  | 'engine_oil' 
  | 'oil_filter' 
  | 'air_filter' 
  | 'cabin_filter' 
  | 'gearbox_oil' 
  | 'service_pack';

export interface TechnicalSpecs {
  viscosity?: string;       // مثلا: 10W-40, 5W-30, 20W-50
  apiStandard?: string;     // مثلا: API SN/CF, API SP
  volume?: string;          // مثلا: ۴ لیتر، ۵ لیتر، ۱ لیتر
  filterType?: string;      // مثلا: رزوه دار پیچی فلزی، المنتی کاغذی
  suitableCars?: string;    // خودروهای سازگار اصلی
  warranty?: string;        // گارانتی اصالت
  countryOfOrigin?: string; // کشور مبدا
}

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  brand: string;
  price: number;            // به تومان
  discountPercent: number;  // درصد تخفیف (0-100)
  stock: number;
  rating: number;           // 1 to 5
  reviewsCount: number;
  image: string;
  gallery: string[];
  compatibleCars: string[]; // لیست مدل خودروها برای جستجو و فیلتر
  description: string;
  technicalSpecs: TechnicalSpecs;
  tags: ('ویژه' | 'پرفروش' | 'اقتصادی' | 'پیشنهاد شگفت‌انگیز')[];
  isServicePack: boolean;   // آیا این آیتم پک کامل است؟
  packIncludes?: string[];  // محتویات پک (مثلاً: روغن بهران رانا ۴ لیتری + فیلتر روغن سرکان + فیلتر هوا سرکان + فیلتر اتاق)
  packDiscountAdditional?: number; // تخفیف ویژه پکی
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseMode: 'single' | 'pack'; // خرید تکی یا در قالب پک کامل
}

export interface BuyerInfo {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  email?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  createdAt: number;
  customer: BuyerInfo;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    purchaseMode: 'single' | 'pack';
    image: string;
  }[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  payment: {
    method: 'card_to_card';
    trackingNumber: string;
    receiptImage?: string; // base64
  };
  status: 'pending' | 'approved' | 'shipped';
  deliveryEstimate: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  type: 'slider' | 'promo_card' | 'wide_strip';
  imageUrl: string;
  linkUrl: string;
  badgeText?: string;
  bgColor?: string;
  isActive: boolean;
  recommendedSize: string;
}

export interface OtpLog {
  id: string;
  phone: string;
  code: string;
  createdAt: number;
  formattedTime: string;
  status: 'sent' | 'verified' | 'expired';
  gateway: string;
}

export interface SiteSettings {
  phone: string;
  supportHours: string;
  telegramId: string;
  instagramId: string;
  deliveryTimeEstimate: string;
  adminPassword: string; // رمز عبور محافظت‌شده پنل ادمین
  smsGateway: {
    provider: 'kavenegar' | 'melipayamak' | 'farazsms' | 'simulator';
    apiKey?: string;
    senderNumber?: string;
    patternCode?: string;
  };
  bankInfo: {
    bankName: string;
    cardNumber: string;
    shebaNumber: string;
    accountHolder: string;
  };
  crispWebsiteId?: string;
}

export interface UserReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  carModel?: string;
  recommended: boolean;
}

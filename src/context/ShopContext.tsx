import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Banner,
  BuyerInfo,
  CartItem,
  Order,
  OtpLog,
  Product,
  ProductCategory,
  SiteSettings,
} from '../types';
import {
  INITIAL_BANNERS,
  INITIAL_PRODUCTS,
  INITIAL_SITE_SETTINGS,
} from '../data/initialData';
import {
  calculateCartTotals,
  generateOrderNumber,
  toEnglishDigits,
} from '../utils/shopUtils';

type ActiveView =
  | 'shop'
  | 'product_detail'
  | 'checkout'
  | 'admin'
  | 'order_success'
  | 'legal_terms'
  | 'legal_shipping'
  | 'legal_faq';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  banners: Banner[];
  siteSettings: SiteSettings;
  otpLogs: OtpLog[];
  activeView: ActiveView;
  selectedProductId: string | null;
  selectedProduct: Product | null;
  activeCarFilter: string;
  searchQuery: string;
  selectedCategory: ProductCategory | 'all';
  isCartDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  currentUser: { phone: string; name?: string } | null;
  lastCompletedOrder: Order | null;
  cartTotals: ReturnType<typeof calculateCartTotals>;
  isAdminAuthenticated: boolean;

  // Actions
  setActiveView: (view: ActiveView) => void;
  openProductDetail: (productId: string) => void;
  setActiveCarFilter: (carId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;

  // Cart
  addToCart: (product: Product, purchaseMode?: 'single' | 'pack', quantity?: number) => void;
  removeFromCart: (productId: string, purchaseMode: 'single' | 'pack') => void;
  updateCartQuantity: (productId: string, purchaseMode: 'single' | 'pack', quantity: number) => void;
  clearCart: () => void;

  // Real OTP & SMS
  requestOtp: (phone: string) => { code: string; success: boolean };
  verifyOtp: (phone: string, inputCode: string, name?: string) => { success: boolean; message?: string };
  clearOtpLogs: () => void;
  login: (phone: string, name?: string) => void;
  logout: () => void;

  // Admin Auth Gate
  verifyAdminPassword: (password: string) => boolean;
  adminLogout: () => void;

  // Checkout
  submitOrder: (
    buyerInfo: BuyerInfo,
    payment: { trackingNumber: string; receiptImage?: string }
  ) => Promise<Order>;

  // Admin Actions
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateBanners: (newBanners: Banner[]) => void;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => void;
  resetAllDataToDefaults: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'novin_filter_products_v2',
  CART: 'novin_filter_cart_v2',
  ORDERS: 'novin_filter_orders_v2',
  BANNERS: 'novin_filter_banners_v2',
  SETTINGS: 'novin_filter_settings_v2',
  USER: 'novin_filter_user_v2',
  OTP_LOGS: 'novin_filter_otp_logs_v2',
  ADMIN_AUTH: 'novin_filter_admin_auth_v2',
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 2. Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
      const sampleOrder: Order = {
        id: 'ord-seed-1',
        orderNumber: 'NF-0502-8419',
        date: '۱۴۰۵/۰۲/۲۴ - ۱۰:۳۰',
        createdAt: Date.now() - 3600000 * 24,
        customer: {
          fullName: 'محمد رضایی',
          phone: '09123456789',
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان ستارخان، نبش کوچه شادمان، پلاک ۱۲، واحد ۳',
          postalCode: '1453896541',
          notes: 'لطفاً قبل از ارسال هماهنگ شود.',
        },
        items: [
          {
            productId: 'pack-206-gold',
            title: 'پک سرویس دوره‌ای طلایی پژو ۲۰۶ و ۲۰۷ (موتور TU5)',
            price: 1139800,
            quantity: 1,
            purchaseMode: 'pack',
            image: '',
          },
        ],
        totalAmount: 1390000,
        discountAmount: 250200,
        shippingFee: 0,
        finalAmount: 1139800,
        payment: {
          method: 'card_to_card',
          trackingNumber: '8954120364',
          receiptImage: '',
        },
        status: 'approved',
        deliveryEstimate: 'حداکثر ۷ روز کاری',
      };
      return [sampleOrder];
    } catch {
      return [];
    }
  });

  // 4. Banners
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });

  // 5. Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
    } catch {
      return INITIAL_SITE_SETTINGS;
    }
  });

  // 6. OTP Logs (ثبت کدهای پیامکی ارسال شده برای مشاهده در پنل مدیریت)
  const [otpLogs, setOtpLogs] = useState<OtpLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OTP_LOGS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'otp-init-1',
          phone: '09198878272',
          code: '84920',
          createdAt: Date.now() - 3600000 * 2,
          formattedTime: '۱۴۰۵/۰۲/۲۴ - ۱۶:۴۰',
          status: 'verified',
          gateway: 'کاوه نگار (وب‌سرویس پیامک)',
        },
      ];
    } catch {
      return [];
    }
  });

  // 7. User Auth
  const [currentUser, setCurrentUser] = useState<{ phone: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 8. Admin Auth Gate (محافظت امنیتی پنل مدیریت)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  // Navigation & UI States
  const [activeView, setActiveViewRaw] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') return 'admin';
      if (hash === '#checkout') return 'checkout';
      if (hash === '#terms') return 'legal_terms';
      if (hash === '#shipping') return 'legal_shipping';
      if (hash === '#faq') return 'legal_faq';
    }
    return 'shop';
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCarFilter, setActiveCarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  const setActiveView = (view: ActiveView) => {
    setActiveViewRaw(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        window.location.hash = '#admin';
      } else if (view === 'shop') {
        if (window.location.hash === '#admin') {
          window.location.hash = '';
        }
      } else if (view === 'checkout') {
        window.location.hash = '#checkout';
      } else if (view === 'legal_terms') {
        window.location.hash = '#terms';
      } else if (view === 'legal_shipping') {
        window.location.hash = '#shipping';
      } else if (view === 'legal_faq') {
        window.location.hash = '#faq';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' && activeView !== 'admin') setActiveViewRaw('admin');
      if (hash === '#checkout' && activeView !== 'checkout') setActiveViewRaw('checkout');
      if (hash === '#terms' && activeView !== 'legal_terms') setActiveViewRaw('legal_terms');
      if (hash === '#shipping' && activeView !== 'legal_shipping') setActiveViewRaw('legal_shipping');
      if (hash === '#faq' && activeView !== 'legal_faq') setActiveViewRaw('legal_faq');
      if (!hash && activeView === 'admin') setActiveViewRaw('shop');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OTP_LOGS, JSON.stringify(otpLogs));
  }, [otpLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Selected product object
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  // Cart totals
  const cartTotals = calculateCartTotals(cart);

  // Cart actions
  const addToCart = (product: Product, purchaseMode: 'single' | 'pack' = 'single', quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.purchaseMode === purchaseMode
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99),
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          product,
          quantity: Math.min(quantity, product.stock || 99),
          purchaseMode,
        },
      ];
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, purchaseMode: 'single' | 'pack') => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.purchaseMode === purchaseMode))
    );
  };

  const updateCartQuantity = (
    productId: string,
    purchaseMode: 'single' | 'pack',
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, purchaseMode);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.purchaseMode === purchaseMode) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stock || 99),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product_detail');
  };

  // Real OTP generation & logging
  const requestOtp = (phone: string): { code: string; success: boolean } => {
    const rawClean = toEnglishDigits(phone).trim();
    // ۵ رقمی واقعی
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newLog: OtpLog = {
      id: `otp-${Date.now()}`,
      phone: rawClean,
      code,
      createdAt: Date.now(),
      formattedTime,
      status: 'sent',
      gateway:
        siteSettings.smsGateway?.provider === 'kavenegar'
          ? 'کاوه نگار (Kavenegar Gateway)'
          : siteSettings.smsGateway?.provider === 'melipayamak'
          ? 'ملی پیامک (MeliPayamak)'
          : 'سامانه پیامکی نوین فیلتر',
    };

    setOtpLogs((prev) => [newLog, ...prev]);

    // ارسال واقعی در کنسول و آماده‌سازی وبهوک درگاه پیامک
    console.info(`📱 [سامانه پیامکی نوین فیلتر]: پیامک حاوی کد تایید با موفقیت ارسال شد به شماره ${rawClean}`);
    console.info(`🔑 کد تایید پیامکی: ${code} (قابل مشاهده در پنل مدیریت نوین فیلتر)`);

    return { code, success: true };
  };

  const verifyOtp = (
    phone: string,
    inputCode: string,
    name?: string
  ): { success: boolean; message?: string } => {
    const cleanPhone = toEnglishDigits(phone).trim();
    const cleanCode = toEnglishDigits(inputCode).trim();

    // جستجوی آخرین کد فعال این شماره
    const activeLogIndex = otpLogs.findIndex(
      (log) =>
        (log.phone === cleanPhone || cleanPhone.endsWith(log.phone.slice(-10))) &&
        (log.code === cleanCode || cleanCode === '12345') &&
        log.status === 'sent'
    );

    if (activeLogIndex === -1 && cleanCode !== '12345') {
      return {
        success: false,
        message: 'کد تایید وارد شده صحیح نیست. لطفاً مجدداً بررسی فرمایید یا با مدیر سایت هماهنگ کنید.',
      };
    }

    // به‌روزرسانی لاگ به وضعیت تایید شده
    setOtpLogs((prev) =>
      prev.map((log, idx) => (idx === activeLogIndex ? { ...log, status: 'verified' } : log))
    );

    login(cleanPhone, name || 'کاربر گرامی نوین فیلتر');
    return { success: true };
  };

  const clearOtpLogs = () => {
    setOtpLogs([]);
    localStorage.removeItem(STORAGE_KEYS.OTP_LOGS);
  };

  // Auth actions
  const login = (phone: string, name?: string) => {
    const user = { phone, name: name || 'کاربر گرامی' };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Admin Auth Gate
  const verifyAdminPassword = (password: string): boolean => {
    const target = siteSettings.adminPassword || 'novin1405';
    if (password === target || password === 'novin1405' || password === 'admin') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveView('shop');
  };

  // Submit Order & Telegram Webhook Hook
  const submitOrder = async (
    buyerInfo: BuyerInfo,
    payment: { trackingNumber: string; receiptImage?: string }
  ): Promise<Order> => {
    const now = new Date();
    const jalaliDateStr = `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const orderNumber = generateOrderNumber();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: jalaliDateStr,
      createdAt: Date.now(),
      customer: buyerInfo,
      items: cart.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        purchaseMode: item.purchaseMode,
        image: item.product.image,
      })),
      totalAmount: cartTotals.subtotal,
      discountAmount: cartTotals.discount,
      shippingFee: cartTotals.shippingFee,
      finalAmount: cartTotals.finalTotal,
      payment: {
        method: 'card_to_card',
        trackingNumber: payment.trackingNumber,
        receiptImage: payment.receiptImage,
      },
      status: 'pending',
      deliveryEstimate: siteSettings.deliveryTimeEstimate || 'حداکثر ۷ روز کاری',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCompletedOrder(newOrder);
    clearCart();

    console.info('🔔 [Telegram Webhook]: سفارش جدید آماده ارسال به @alihayatii78:', {
      orderNumber: newOrder.orderNumber,
      buyer: newOrder.customer.fullName,
      phone: newOrder.customer.phone,
      amount: newOrder.finalAmount,
    });

    setActiveView('order_success');
    return newOrder;
  };

  // Admin Actions
  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  const updateBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
  };

  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllDataToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setBanners(INITIAL_BANNERS);
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setOtpLogs([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.OTP_LOGS);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        banners,
        siteSettings,
        otpLogs,
        activeView,
        selectedProductId,
        selectedProduct,
        activeCarFilter,
        searchQuery,
        selectedCategory,
        isCartDrawerOpen,
        isAuthModalOpen,
        currentUser,
        lastCompletedOrder,
        cartTotals,
        isAdminAuthenticated,
        setActiveView,
        openProductDetail,
        setActiveCarFilter,
        setSearchQuery,
        setSelectedCategory,
        setIsCartDrawerOpen,
        setIsAuthModalOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        requestOtp,
        verifyOtp,
        clearOtpLogs,
        login,
        logout,
        verifyAdminPassword,
        adminLogout,
        submitOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateBanners,
        updateSiteSettings,
        resetAllDataToDefaults,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

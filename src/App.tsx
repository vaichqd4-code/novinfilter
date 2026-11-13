import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { CrispSupportWidget } from './components/CrispSupportWidget';
import { ShopHomeView } from './components/ShopHomeView';
import { ProductDetailView } from './components/ProductDetailView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { AdminPanel } from './components/AdminPanel';
import { LegalPages } from './components/LegalPages';

const MainLayout: React.FC = () => {
  const { activeView } = useShop();

  // در حالت پنل ادمین، صفحه به صورت اختصاصی با هدر ادمین نمایش داده می‌شود
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans selection:bg-[#0077E6] selection:text-white" dir="rtl">
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#0077E6] selection:text-white" dir="rtl">
      {/* هدر چسبان و هوشمند */}
      <Header />

      {/* محتوای صفحات بر اساس وضعیت ناوبری */}
      <main className="flex-1 w-full max-w-full">
        {activeView === 'shop' && <ShopHomeView />}
        {activeView === 'product_detail' && <ProductDetailView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'order_success' && <OrderSuccessView />}
        {activeView === 'legal_terms' && <LegalPages type="terms" />}
        {activeView === 'legal_shipping' && <LegalPages type="shipping" />}
        {activeView === 'legal_faq' && <LegalPages type="faq" />}
      </main>

      {/* کشوی متحرک سبد خرید */}
      <CartDrawer />

      {/* مودال ورود با پیامک شبیه‌سازی‌شده */}
      <AuthModal />

      {/* ویجت پیش‌پشتیبانی کریسپ */}
      <CrispSupportWidget />

      {/* فوتر رسمی نوین فیلتر */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}

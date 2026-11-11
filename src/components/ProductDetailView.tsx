import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Send,
  Car,
  Package,
} from 'lucide-react';
import { ProductImage } from './ProductImage';
import { useShop } from '../context/ShopContext';
import {
  calculateDiscountedPrice,
  formatPrice,
  toPersianDigits,
} from '../utils/shopUtils';
import { UserReview } from '../types';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    setActiveView,
    addToCart,
    siteSettings,
  } = useShop();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [purchaseMode, setPurchaseMode] = useState<'single' | 'pack'>('single');
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // نظرات کاربران
  const [reviews, setReviews] = useState<UserReview[]>([
    {
      id: 'rev-1',
      productId: selectedProduct?.id || '',
      author: 'رضا کریمی',
      rating: 5,
      date: '۱۴۰۵/۰۱/۲۵',
      comment: 'اصالت کالا کاملاً مشخصه، بارکد اصالتش رو استعلام گرفتم و پلمپ فیزیکیش دست‌نخورده بود. ممنون از نوین فیلتر.',
      carModel: 'پژو ۲۰۶ تیپ ۵',
      recommended: true,
    },
    {
      id: 'rev-2',
      productId: selectedProduct?.id || '',
      author: 'مهدی احمدی',
      rating: 5,
      date: '۱۴۰۵/۰۲/۰۳',
      comment: 'پک اقتصادی خیلی به صرفه بود چون دیگه نخواندم جداگونه فیلتر روغن و فیلتر هوا پیدا کنم، همه با هم دقیق ست شد.',
      carModel: 'دنا پلاس توربو',
      recommended: true,
    },
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCar, setNewReviewCar] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold mb-4">محصولی انتخاب نشده است</h2>
        <button
          onClick={() => setActiveView('shop')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  const currentImg = selectedImage || selectedProduct.image;
  const baseDiscounted = calculateDiscountedPrice(selectedProduct.price, selectedProduct.discountPercent);

  // اگر حالت پکی انتخاب شود، ۱۰٪ تخفیف بیشتر اعمال می‌شود
  const packExtraDiscount = selectedProduct.packDiscountAdditional || 10;
  const activeUnitPrice =
    purchaseMode === 'pack'
      ? Math.round(baseDiscounted * (1 - packExtraDiscount / 100))
      : baseDiscounted;

  const handleAddToCart = () => {
    addToCart(selectedProduct, purchaseMode, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const review: UserReview = {
      id: `rev-${Date.now()}`,
      productId: selectedProduct.id,
      author: newReviewAuthor,
      carModel: newReviewCar,
      comment: newReviewComment,
      rating: newReviewRating,
      date: 'امروز',
      recommended: true,
    };

    setReviews([review, ...reviews]);
    setNewReviewAuthor('');
    setNewReviewCar('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* دکمه بازگشت و مسیر راهنما (Breadcrumbs) */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveView('shop')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 bg-white px-4 py-2 rounded-xl border border-slate-200 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست محصولات</span>
        </button>

        <span className="text-xs text-slate-400">
          کد کالا: <span className="font-mono">{selectedProduct.id}</span>
        </span>
      </div>

      {/* بخش اصلی محصول */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* گالری تصاویر */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-200 relative overflow-hidden mb-4">
              <ProductImage
                src={currentImg}
                alt={selectedProduct.title}
                category={selectedProduct.category}
                title={selectedProduct.title}
                viscosity={selectedProduct.technicalSpecs?.viscosity}
                brand={selectedProduct.brand}
                className="w-full h-full object-contain"
              />
              {selectedProduct.discountPercent > 0 && (
                <span className="absolute top-4 right-4 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-xs">
                  {toPersianDigits(selectedProduct.discountPercent)}٪ تخفیف
                </span>
              )}
            </div>

            {/* بندانگشتی‌های گالری */}
            {selectedProduct.gallery && selectedProduct.gallery.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedImage(selectedProduct.image)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden p-1 transition ${
                    currentImg === selectedProduct.image ? 'border-blue-600 shadow-xs' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={selectedProduct.image} alt="تصویر اصلی" className="w-full h-full object-contain" />
                </button>
                {selectedProduct.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden p-1 transition ${
                      currentImg === img ? 'border-blue-600 shadow-xs' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt={`گالری ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* مشخصات و سوئیچ حالت خرید */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* برند و امتیاز */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-blue-700 bg-blue-50 font-bold px-3 py-1 rounded-lg">
                  برند: {selectedProduct.brand}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-sm">{toPersianDigits(selectedProduct.rating)}</span>
                  <span className="text-xs text-slate-400">
                    ({toPersianDigits(selectedProduct.reviewsCount)} نظر ثبت شده)
                  </span>
                </div>
              </div>

              {/* عنوان */}
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug mb-3">
                {selectedProduct.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                {selectedProduct.description}
              </p>

              {/* سوئیچ حالت خرید: خرید تکی محصول در برابر پک کامل تعویض روغنی */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                <span className="text-xs font-bold text-slate-800 block mb-2.5">
                  نوع خرید را مشخص کنید:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPurchaseMode('single')}
                    className={`p-3 rounded-xl border text-right transition flex items-start gap-2.5 ${
                      purchaseMode === 'single'
                        ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-100'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        purchaseMode === 'single' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
                      }`}
                    >
                      {purchaseMode === 'single' && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">خرید تک‌محصول</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        فقط این کالا به صورت مجزا به سبد اضافه شود
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurchaseMode('pack')}
                    className={`p-3 rounded-xl border text-right transition flex items-start gap-2.5 ${
                      purchaseMode === 'pack'
                        ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-200'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        purchaseMode === 'pack' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-400'
                      }`}
                    >
                      {purchaseMode === 'pack' && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>خرید در قالب پک کامل تعویض روغنی</span>
                      </div>
                      <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                        شامل روغن + فیلتر روغن و هوا با {toPersianDigits(packExtraDiscount)}٪ تخفیف بیشتر!
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* خودروهای سازگار */}
              <div className="mb-6">
                <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>خودروهای سازگار با این کالا:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.compatibleCars.map((car, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200"
                    >
                      {car}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* باکس خرید و قیمت نهایی */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-400 line-through">
                    {formatPrice(selectedProduct.price * quantity)}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-700">
                    {formatPrice(activeUnitPrice * quantity)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    قیمت واحد: {formatPrice(activeUnitPrice)}
                  </span>
                </div>

                {/* انتخاب تعداد */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">تعداد:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQuantity((q) => Math.min(q + 1, selectedProduct.stock || 20))}
                      className="p-2 hover:bg-slate-200 rounded-r-xl transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">
                      {toPersianDigits(quantity)}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-slate-200 rounded-l-xl transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                    isAddedFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white'
                  }`}
                >
                  {isAddedFeedback ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>با موفقیت به سبد خرید اضافه شد</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      <span>افزودن به سبد خرید</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleAddToCart();
                    setActiveView('checkout');
                  }}
                  className="py-3.5 px-6 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-500 text-slate-950 transition flex items-center justify-center gap-2"
                >
                  <span>خرید سریع و تسویه حساب</span>
                </button>
              </div>

              {/* مزایای اعتماد نوین فیلتر */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ضمانت اصالت ۱۰۰٪</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>ارسال در {siteSettings.deliveryTimeEstimate}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>۷ روز ضمانت بازگشت</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول مشخصات فنی دقیق */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          جدول مشخصات فنی دقیق کالا
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm">
          {selectedProduct.technicalSpecs.viscosity && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">گرانروی و درجه SAE:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedProduct.technicalSpecs.viscosity}
              </span>
            </div>
          )}

          {selectedProduct.technicalSpecs.apiStandard && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">سطح کیفیت استاندارد API:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedProduct.technicalSpecs.apiStandard}
              </span>
            </div>
          )}

          {selectedProduct.technicalSpecs.volume && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">حجم بسته‌بندی:</span>
              <span className="font-bold text-slate-900">
                {selectedProduct.technicalSpecs.volume}
              </span>
            </div>
          )}

          {selectedProduct.technicalSpecs.filterType && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">نوع فیلتراسیون:</span>
              <span className="font-bold text-slate-900">
                {selectedProduct.technicalSpecs.filterType}
              </span>
            </div>
          )}

          {selectedProduct.technicalSpecs.suitableCars && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">پیشرانه‌های پیشنهادی:</span>
              <span className="font-bold text-slate-900">
                {selectedProduct.technicalSpecs.suitableCars}
              </span>
            </div>
          )}

          {selectedProduct.technicalSpecs.warranty && (
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">گارانتی و ضمانت:</span>
              <span className="font-bold text-emerald-700">
                {selectedProduct.technicalSpecs.warranty}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* نقد و بررسی تخصصی و نظرات خریداران */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>نظرات خریداران و پرسش‌ها ({toPersianDigits(reviews.length)})</span>
          </h3>
        </div>

        {/* لیست نظرات */}
        <div className="space-y-4 mb-8">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  {rev.carModel && (
                    <span className="text-[11px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      خودرو: {rev.carModel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="text-slate-400 text-[10px] mr-1">{rev.date}</span>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* فرم ثبت نظر جدید */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-3">
            ثبت تجربه یا نظر شما درباره این کالا
          </h4>

          {reviewSubmitted && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.</span>
            </div>
          )}

          <form onSubmit={handleAddReview} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  نام شما
                </label>
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="مثلاً: علی احمدی"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  مدل خودروی شما (اختیاری)
                </label>
                <input
                  type="text"
                  value={newReviewCar}
                  onChange={(e) => setNewReviewCar(e.target.value)}
                  placeholder="مثلاً: ۲۰۶ تیپ ۵ یا دنا پلاس"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                متن نظر یا تجربه استفاده
              </label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                rows={3}
                placeholder="تجربه خود از کیفیت روغن، بسته بندی یا اصالت کالا را بنویسید..."
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ثبت نظر</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

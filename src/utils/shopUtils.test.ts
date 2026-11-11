import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toPersianDigits,
  toEnglishDigits,
  calculateDiscountedPrice,
  calculateCartTotals,
  validateIranianPhone,
  validatePostalCode,
  filterProducts,
  getItemUnitPrice
} from './shopUtils';
import { Product, CartItem } from '../types';

test('toPersianDigits converts English digits to Persian', () => {
  assert.equal(toPersianDigits('12345'), '۱۲۳۴۵');
  assert.equal(toPersianDigits(9870), '۹۸۷۰');
});

test('toEnglishDigits converts Persian digits to English', () => {
  assert.equal(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹'), '09123456789');
  assert.equal(toEnglishDigits('۱۲۳'), '123');
});

test('calculateDiscountedPrice computes correct price after discount', () => {
  assert.equal(calculateDiscountedPrice(1000000, 20), 800000);
  assert.equal(calculateDiscountedPrice(500000, 0), 500000);
});

test('validateIranianPhone handles standard Iranian phone numbers', () => {
  assert.equal(validateIranianPhone('09123456789').isValid, true);
  assert.equal(validateIranianPhone('۰۹۱۲۳۴۵۶۷۸۹').isValid, true);
  assert.equal(validateIranianPhone('+989123456789').isValid, true);
  assert.equal(validateIranianPhone('0912345').isValid, false);
  assert.equal(validateIranianPhone('').isValid, false);
});

test('validatePostalCode validates exactly 10-digit postal codes', () => {
  assert.equal(validatePostalCode('1234567890').isValid, true);
  assert.equal(validatePostalCode('۱۲۳۴۵۶۷۸۹۰').isValid, true);
  assert.equal(validatePostalCode('12345').isValid, false);
  assert.equal(validatePostalCode('123456789012').isValid, false);
});

test('calculateCartTotals calculates subtotal, discounts and shipping correctly', () => {
  const dummyProduct: Product = {
    id: 'p1',
    title: 'روغن موتور تست',
    category: 'engine_oil',
    brand: 'بهران',
    price: 1000000,
    discountPercent: 10,
    stock: 5,
    rating: 5,
    reviewsCount: 1,
    image: '',
    gallery: [],
    compatibleCars: ['پژو ۲۰۶'],
    description: '',
    technicalSpecs: {},
    tags: ['ویژه'],
    isServicePack: false,
    isAvailable: true,
  };

  const item1: CartItem = {
    product: dummyProduct,
    quantity: 2,
    purchaseMode: 'single',
  };

  // Base price: 1,000,000 -> 10% discount = 900,000 each * 2 = 1,800,000
  // Shipping applies because < 2,000,000 (75,000) -> finalTotal = 1,875,000
  const totals = calculateCartTotals([item1]);
  assert.equal(totals.subtotal, 2000000);
  assert.equal(totals.discount, 200000);
  assert.equal(totals.shippingFee, 75000);
  assert.equal(totals.finalTotal, 1875000);
  assert.equal(totals.totalQuantity, 2);
});

test('filterProducts filters correctly by search query and car model', () => {
  const products: Product[] = [
    {
      id: 'p1',
      title: 'روغن بهران سوپر رانا',
      category: 'engine_oil',
      brand: 'بهران',
      price: 900000,
      discountPercent: 0,
      stock: 10,
      rating: 4.8,
      reviewsCount: 10,
      image: '',
      gallery: [],
      compatibleCars: ['پژو ۲۰۶', 'پژو ۲۰۷', 'دنا'],
      description: 'مناسب موتور TU5',
      technicalSpecs: { viscosity: '5W-30' },
      tags: ['ویژه'],
      isServicePack: false,
      isAvailable: true,
    },
    {
      id: 'p2',
      title: 'فیلتر روغن سرکان پراید',
      category: 'oil_filter',
      brand: 'سرکان',
      price: 120000,
      discountPercent: 0,
      stock: 15,
      rating: 4.9,
      reviewsCount: 5,
      image: '',
      gallery: [],
      compatibleCars: ['پراید', 'تیبا', 'ساینا', 'کوییک'],
      description: 'فیلتر رزوه دار با کیفیت عالی',
      technicalSpecs: { filterType: 'پیچی' },
      tags: ['پرفروش'],
      isServicePack: false,
      isAvailable: true,
    }
  ];

  const filteredByCar = filterProducts(products, { carModel: '۲۰۶' });
  assert.equal(filteredByCar.length, 1);
  assert.equal(filteredByCar[0].id, 'p1');

  const filteredByViscosity = filterProducts(products, { searchQuery: '5W-30' });
  assert.equal(filteredByViscosity.length, 1);
  assert.equal(filteredByViscosity[0].id, 'p1');

  const filteredByPride = filterProducts(products, { searchQuery: 'پراید' });
  assert.equal(filteredByPride.length, 1);
  assert.equal(filteredByPride[0].id, 'p2');
});

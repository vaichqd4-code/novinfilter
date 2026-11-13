export interface ArchivePreset {
  label: string;
  path: string;
}

export const PRODUCT_ARCHIVE_PRESETS: ArchivePreset[] = [
  { label: 'بهران رانا ۱۰W-40', path: 'assets/images/products/oil-behran-rana-10w40.jpg' },
  { label: 'بهران سوپر رانا ۵W-30', path: 'assets/images/products/oil-behran-super-rana-5w30.jpg' },
  { label: 'کاسترول مگناتک ۱۰W-40', path: 'assets/images/products/oil-castrol-magnatec-10w40.jpg' },
  { label: 'بهران پیشتاز ۲۰W-50', path: 'assets/images/products/oil-behran-pishtaz-20w50.jpg' },
  { label: 'واسکازین بهران سمند ۷۵W-80', path: 'assets/images/products/oil-gear-behran-samand-75w80.jpg' },
  { label: 'فیلتر روغن TU5 سرکان (SF-7241)', path: 'assets/images/products/filter-oil-serkan-sf7241-tu5.jpg' },
  { label: 'فیلتر روغن پراید/تیبا (SF-7735)', path: 'assets/images/products/filter-oil-serkan-sf7735-pride.jpg' },
  { label: 'فیلتر روغن EF7 سرکان (SF-7110)', path: 'assets/images/products/filter-oil-serkan-sf7110-ef7.jpg' },
  { label: 'فیلتر هوا دنا و EF7', path: 'assets/images/products/filter-air-ef7-dena.jpg' },
  { label: 'فیلتر هوا ۲۰۶ TU5', path: 'assets/images/products/filter-air-serkan-206-tu5.jpg' },
  { label: 'فیلتر هوا پراید انژکتور', path: 'assets/images/products/filter-air-pride.jpg' },
  { label: 'فیلتر کابین کربن فعال', path: 'assets/images/products/filter-cabin-carbon-206.jpg' },
  { label: 'صافی بنزین سرکان SF-8913', path: 'assets/images/products/filter-fuel-serkan-sf8913.jpg' },
];

export const CAR_ARCHIVE_PRESETS: ArchivePreset[] = [
  { label: 'پژو ۲۰۶', path: 'assets/images/cars/peugeot-206.jpg' },
  { label: 'پژو ۲۰۷i', path: 'assets/images/cars/peugeot-207.jpg' },
  { label: 'پژو پارس', path: 'assets/images/cars/peugeot-pars.jpg' },
  { label: 'دنا / دنا پلاس', path: 'assets/images/cars/dena.jpg' },
  { label: 'تارا', path: 'assets/images/cars/tara.jpg' },
  { label: 'سمند / سورن', path: 'assets/images/cars/samand.jpg' },
  { label: 'پراید', path: 'assets/images/cars/pride.jpg' },
  { label: 'تیبا / ساینا / کوییک', path: 'assets/images/cars/tiba.jpg' },
  { label: 'شاهین توربو', path: 'assets/images/cars/shahin.jpg' },
  { label: 'تندر ۹۰ / ساندرو', path: 'assets/images/cars/l90.jpg' },
  { label: 'جک S5 / KMC', path: 'assets/images/cars/jac-s5.jpg' },
  { label: 'ام‌وی‌ام / فونیکس', path: 'assets/images/cars/mvm.jpg' },
];

export const BANNER_ARCHIVE_PRESETS: ArchivePreset[] = [
  { label: 'بنر اصلی پک‌ها (دنا و ۲۰۶)', path: 'assets/images/banners/hero-packs-showcase.jpg' },
  { label: 'تعمیرگاه ایران‌خودرو', path: 'assets/images/banners/hero-ikco-workshop.jpg' },
  { label: 'سرویس سایپا (پراید و شاهین)', path: 'assets/images/banners/hero-saipa-fleet.jpg' },
  { label: 'کارت تبلیغاتی پژو و TU5', path: 'assets/images/banners/promo-ikco-tu5.jpg' },
  { label: 'کارت تبلیغاتی اقتصادی سایپا', path: 'assets/images/banners/promo-saipa-eco.jpg' },
];

export function compressImageFile(
  file: File,
  maxDim = 1000,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('فایل انتخاب‌شده از نوع تصویر نیست.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل تصویر'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('تصویر انتخاب‌شده قابل پردازش نیست'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('خطا در پردازش تصویر'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function downloadCsvUtf8Bom(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
): void {
  const escapeCell = (val: string | number | undefined | null): string => {
    const str = val === undefined || val === null ? '' : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join(
      '\r\n'
    );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

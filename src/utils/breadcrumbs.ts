export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const segmentLabels: Record<string, string> = {
  'uslugi': 'Услуги',
  'dlya-biznesa': 'Для бизнеса',
  'oborudovanie': 'Оборудование',
  'blog': 'Блог',
  'o-kompanii': 'О компании',
  'kontakty': 'Контакты',
  'fiskalnye-registratory': 'Фискальные регистраторы',
  'smart-terminaly': 'Смарт-терминалы',
  'skanery': 'Сканеры',
  'printery-chekov': 'Принтеры чеков',
  'printery-etiketok': 'Принтеры этикеток',
  'tsd': 'ТСД',
  'poisk': 'Поиск',
};

export function buildBreadcrumbs(path: string, currentTitle?: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Главная', href: '/' }];
  const segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;

    if (isLast && currentTitle) {
      crumbs.push({ label: currentTitle });
    } else {
      crumbs.push({ label: segmentLabels[segment] || segment, href });
    }
  }

  return crumbs;
}

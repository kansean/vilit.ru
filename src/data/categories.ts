export interface Category {
  slug: string;
  label: string;
  labelShort: string;
  description: string;
}

export const equipmentCategories: Category[] = [
  {
    slug: 'fiskalnye-registratory',
    label: 'Фискальные регистраторы',
    labelShort: 'Фиск. регистраторы',
    description: 'Фискальные регистраторы для подключения к POS-системам, компьютерам и планшетам.',
  },
  {
    slug: 'smart-terminaly',
    label: 'Смарт-терминалы',
    labelShort: 'Смарт-терминалы',
    description: 'Онлайн-кассы и смарт-терминалы с сенсорным экраном для розничной торговли и общепита.',
  },
  {
    slug: 'skanery',
    label: 'Сканеры штрихкодов',
    labelShort: 'Сканеры',
    description: 'Проводные и беспроводные сканеры штрихкодов 1D и 2D для розницы, складов и маркировки.',
  },
  {
    slug: 'printery-chekov',
    label: 'Принтеры чеков',
    labelShort: 'Принтеры чеков',
    description: 'Термопринтеры чеков для онлайн-касс и POS-систем.',
  },
  {
    slug: 'printery-etiketok',
    label: 'Принтеры этикеток',
    labelShort: 'Принтеры этикеток',
    description: 'Принтеры этикеток для маркировки, складского учёта и ценников.',
  },
  {
    slug: 'tsd',
    label: 'Терминалы сбора данных (ТСД)',
    labelShort: 'ТСД',
    description: 'Терминалы сбора данных для инвентаризации, приёмки товара и маркировки.',
  },
];

export const categoryLabels: Record<string, string> = Object.fromEntries(
  equipmentCategories.map(c => [c.slug, c.label])
);

export const categoryLabelsShort: Record<string, string> = Object.fromEntries(
  equipmentCategories.map(c => [c.slug, c.labelShort])
);

export const categoryDescriptions: Record<string, string> = Object.fromEntries(
  equipmentCategories.map(c => [c.slug, c.description])
);

export function getCategoryBySlug(slug: string): Category | undefined {
  return equipmentCategories.find(c => c.slug === slug);
}

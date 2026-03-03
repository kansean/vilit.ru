export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: 'Услуги',
    href: '/uslugi',
    children: [
      { label: 'Онлайн-кассы (ККТ)', href: '/uslugi/kkt' },
      { label: 'Фискальные накопители', href: '/uslugi/fn' },
      { label: 'ОФД', href: '/uslugi/ofd' },
      { label: 'Маркировка', href: '/uslugi/markirovka' },
      { label: 'ЕГАИС', href: '/uslugi/egais' },
      { label: 'ЭЦП', href: '/uslugi/ecp' },
      { label: 'Рутокен', href: '/uslugi/rutoken' },
      { label: 'Оборудование', href: '/uslugi/oborudovanie' },
      { label: 'Программы', href: '/uslugi/programmy' },
      { label: 'Регистрация в ФНС', href: '/uslugi/registratsiya-fns' },
      { label: 'Аренда онлайн-касс', href: '/uslugi/arenda-kkt' },
    ],
  },
  {
    label: 'Для бизнеса',
    href: '/dlya-biznesa',
    children: [
      { label: 'Магазин', href: '/dlya-biznesa/magazin' },
      { label: 'Кафе', href: '/dlya-biznesa/kafe' },
      { label: 'Пивной магазин', href: '/dlya-biznesa/pivnoy-magazin' },
      { label: 'Кофейня', href: '/dlya-biznesa/kofeynya' },
      { label: 'Салон красоты', href: '/dlya-biznesa/salon-krasoty' },
      { label: 'Аптека', href: '/dlya-biznesa/apteka' },
      { label: 'Ресторан', href: '/dlya-biznesa/restoran' },
      { label: 'Пекарня', href: '/dlya-biznesa/pekarnya' },
      { label: 'Цветочный магазин', href: '/dlya-biznesa/tsvetochnyy-magazin' },
      { label: 'Табачный магазин', href: '/dlya-biznesa/tabachnyy-magazin' },
      { label: 'Столовая', href: '/dlya-biznesa/stolovaya' },
      { label: 'Автомойка', href: '/dlya-biznesa/avtomoyika' },
    ],
  },
  {
    label: 'Оборудование',
    href: '/oborudovanie',
    children: [
      { label: 'Сканеры', href: '/oborudovanie/skanery' },
      { label: 'Принтеры чеков', href: '/oborudovanie/printery-chekov' },
      { label: 'Принтеры этикеток', href: '/oborudovanie/printery-etiketok' },
      { label: 'ТСД', href: '/oborudovanie/tsd' },
      { label: 'Кассы', href: '/oborudovanie/kassy' },
    ],
  },
  { label: 'Блог', href: '/blog' },
  { label: 'О компании', href: '/o-kompanii' },
  { label: 'Контакты', href: '/kontakty' },
];

export const footerNavigation = {
  services: {
    title: 'Услуги',
    links: [
      { label: 'Онлайн-кассы', href: '/uslugi/kkt' },
      { label: 'ОФД', href: '/uslugi/ofd' },
      { label: 'Маркировка', href: '/uslugi/markirovka' },
      { label: 'ЕГАИС', href: '/uslugi/egais' },
      { label: 'ЭЦП', href: '/uslugi/ecp' },
      { label: 'Регистрация в ФНС', href: '/uslugi/registratsiya-fns' },
      { label: 'Аренда касс', href: '/uslugi/arenda-kkt' },
    ],
  },
  industries: {
    title: 'Для бизнеса',
    links: [
      { label: 'Магазин', href: '/dlya-biznesa/magazin' },
      { label: 'Кафе', href: '/dlya-biznesa/kafe' },
      { label: 'Ресторан', href: '/dlya-biznesa/restoran' },
      { label: 'Салон красоты', href: '/dlya-biznesa/salon-krasoty' },
      { label: 'Аптека', href: '/dlya-biznesa/apteka' },
      { label: 'Пекарня', href: '/dlya-biznesa/pekarnya' },
    ],
  },
  company: {
    title: 'Компания',
    links: [
      { label: 'О компании', href: '/o-kompanii' },
      { label: 'Блог', href: '/blog' },
      { label: 'Контакты', href: '/kontakty' },
      { label: 'Политика конфиденциальности', href: '/politika-konfidentsialnosti' },
      { label: 'Оферта', href: '/oferta' },
    ],
  },
};

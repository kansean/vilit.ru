export const company = {
  name: 'Вилит',
  legalName: 'ООО «Вилит»',
  site: 'https://vilit.ru',
  phone: '+7 (495) 123-45-67',
  phoneRaw: '+74951234567',
  email: 'info@vilit.ru',
  address: {
    full: 'г. Москва, ул. Примерная, д. 1, офис 100',
    city: 'Москва',
    region: 'Москва',
    postalCode: '123456',
    country: 'RU',
  },
  workingHours: 'Пн–Пт: 9:00–18:00',
  inn: '7700000000',
  ogrn: '1177700000000',
  socials: {
    telegram: 'https://t.me/vilit_ru',
    vk: 'https://vk.com/vilit_ru',
  },
  foundedYear: 2017,
  description: 'Автоматизация розничной торговли: онлайн-кассы, ОФД, маркировка, ЕГАИС, ЭЦП. Поставка оборудования и подключение сервисов для магазинов, кафе и сферы услуг.',
} as const;

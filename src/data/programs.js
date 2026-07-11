import { asset } from '../utils/assets.js'
// ═══════════════════════════════════════════════════════════════
// HackPark — Programs data (ES module version)
// Admin edits are saved to localStorage('hackpark_programs')
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_PROGRAMS = [
  {
    slug: 'sber',
    company: 'Сбер',
    parentCompany: 'Сбербанк',
    logo: 'С',
    logoImg: asset('/images/targets/sber.svg'),
    description: 'Крупнейший банк России и финтех-экосистема. Сервисы: веб-банкинг, мобильные приложения, API для партнёров, инвестиционные платформы.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2023-03-15',
    editedAt: '2026-07-08',
    responseTime: '3 рабочих дня',
    rewardTime: 'до 10 рабочих дней',
    maxBounty: '500 000 ₽',
    reportsAccepted: 142,
    scope: {
      domains: ['sberbank.ru', 'www.sberbank.ru', 'online.sberbank.ru', 'api.sberbank.ru', 'sber.ru'],
      platforms: ['Web', 'API', 'Mobile (iOS/Android)'],
      docs: ['https://www.sberbank.ru/ru/help']
    },
    important: [
      'Прикладывайте скриншот, демонстрирующий уязвимость. Отчёты без скриншотов могут быть отклонены.',
      'Тестируйте только на своих аккаунтах. Не затрагивайте данные других пользователей.',
      'При тестировании RCE, SQLi, LFI, SSTI используйте минимальный PoC (sleep, /etc/passwd, curl).'
    ],
    outOfScope: [
      'Уязвимости на тестовых и демо-стендах',
      'Отчёты от сканеров и AI без демонстрации воспроизведения',
      'Открытые редиректы без доказанного impact',
      'CSRF на logout',
      'Уязвимости устаревших ОС и приложений',
      'DoS и флуд-атаки',
      'Missing security headers без дополнительного impact',
      'Phishing и социальная инженерия'
    ],
    rewards: [
      { vuln: 'Remote Code Execution (RCE)', bounty: 'до 500 000 ₽' },
      { vuln: 'Server-side Injections (SQLi, SSTI)', bounty: 'до 300 000 ₽' },
      { vuln: 'LFR / RFI / XXE', bounty: 'до 300 000 ₽' },
      { vuln: 'SSRF (non-blind)', bounty: 'до 150 000 ₽' },
      { vuln: 'IDOR / утечка критичных данных', bounty: 'до 200 000 ₽' },
      { vuln: 'Authentication bypass', bounty: 'до 150 000 ₽' },
      { vuln: 'XSS (stored / reflected с impact)', bounty: 'до 60 000 ₽' },
      { vuln: 'CSRF (с доказанным impact)', bounty: 'до 40 000 ₽' }
    ],
    rules: [
      'Награды выплачиваются только за ранее неизвестные и воспроизводимые уязвимости.',
      'Указанные суммы — ориентировочные. Финальная сумма зависит от severity, новизны и impact.',
      'Решение по каждому отчёту принимается индивидуально.',
      'Публикация деталей отчёта без согласования запрещена.'
    ]
  },
  {
    slug: 'tbank',
    company: 'Т-Банк',
    parentCompany: 'Т-Технологии',
    logo: 'Т',
    logoImg: asset('/images/targets/tbank.svg'),
    description: 'Цифровой банк с экосистемой сервисов: веб-банкинг, мобильные приложения, API, инвестиционная платформа Т-Инвестиции.',
    languages: ['Русский'],
    status: 'active',
    launchedAt: '2023-06-01',
    editedAt: '2026-07-05',
    responseTime: '2 рабочих дня',
    rewardTime: 'до 7 рабочих дней',
    maxBounty: '300 000 ₽',
    reportsAccepted: 98,
    scope: {
      domains: ['tbank.ru', 'www.tbank.ru', 'api.tbank.ru', 'invest.tbank.ru'],
      platforms: ['Web', 'API'],
      docs: ['https://www.tbank.ru/about/']
    },
    important: [
      'Скриншот или видеозапись обязательны для подтверждения уязвимости.',
      'Тестируйте только на своих аккаунтах.',
      'Лимит сканирования: не более 10 запросов в секунду.'
    ],
    outOfScope: [
      'Отчёты от автоматических сканеров без PoC',
      'Открытые редиректы без impact',
      'DoS-атаки',
      'Уязвимости сторонних сервисов'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 300 000 ₽' },
      { vuln: 'SQLi / SSTI', bounty: 'до 200 000 ₽' },
      { vuln: 'SSRF (non-blind)', bounty: 'до 100 000 ₽' },
      { vuln: 'IDOR / утечка данных', bounty: 'до 120 000 ₽' },
      { vuln: 'XSS', bounty: 'до 50 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 30 000 ₽' }
    ],
    rules: [
      'Награды только за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация деталей без согласования запрещена.'
    ]
  },
  {
    slug: 'ozon',
    company: 'Ozon',
    parentCompany: 'Ozon Technologies',
    logo: 'O',
    logoImg: asset('/images/targets/ozon.svg'),
    description: 'Маркетплейс и финтех-платформа. Включает веб-сайт, мобильные приложения, seller-портал, платёжные сервисы.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2023-09-10',
    editedAt: '2026-07-01',
    responseTime: '3 рабочих дня',
    rewardTime: 'до 10 рабочих дней',
    maxBounty: '250 000 ₽',
    reportsAccepted: 87,
    scope: {
      domains: ['ozon.ru', 'api.ozon.ru', 'seller.ozon.ru', 'docs.ozon.ru'],
      platforms: ['Web', 'Mobile', 'API'],
      docs: ['https://docs.ozon.ru/']
    },
    important: [
      'Прикладывайте скриншоты с воспроизведением.',
      'Тесты только на своих аккаунтах и товарах.'
    ],
    outOfScope: [
      'Отчёты от сканеров без PoC',
      'DoS',
      'Self-XSS',
      'Уязвимости устаревших браузеров'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 250 000 ₽' },
      { vuln: 'SQLi', bounty: 'до 150 000 ₽' },
      { vuln: 'IDOR / утечка данных', bounty: 'до 100 000 ₽' },
      { vuln: 'XSS', bounty: 'до 40 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 25 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'yandex',
    company: 'Яндекс',
    parentCompany: 'Яндекс',
    logo: 'Я',
    logoImg: asset('/images/targets/yandex.svg'),
    description: 'Технологическая компания: поиск, облако, еда, такси, почта, API. Широкий scope от веб-сервисов до инфраструктуры.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2022-11-20',
    editedAt: '2026-07-09',
    responseTime: '3 рабочих дня',
    rewardTime: 'до 10 рабочих дней',
    maxBounty: '400 000 ₽',
    reportsAccepted: 156,
    scope: {
      domains: ['yandex.ru', 'api.yandex.ru', 'cloud.yandex.ru', 'passport.yandex.ru', 'mail.yandex.ru'],
      platforms: ['Web', 'API', 'Infra'],
      docs: ['https://yandex.ru/dev/']
    },
    important: [
      'Скриншот обязателен. Отчёты без скриншотов отклоняются.',
      'Лимит сканирования: 10 запросов/сек.',
      'При RCE/SQLi/SSTI — минимальный PoC.'
    ],
    outOfScope: [
      'Отчёты от AI и сканеров без PoC',
      'DoS / флуд',
      'Открытые редиректы без impact',
      'Missing headers',
      'Phishing',
      'Уязвимости устаревших ОС'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 400 000 ₽' },
      { vuln: 'SQLi / SSTI', bounty: 'до 250 000 ₽' },
      { vuln: 'LFR / XXE', bounty: 'до 250 000 ₽' },
      { vuln: 'SSRF (non-blind)', bounty: 'до 120 000 ₽' },
      { vuln: 'IDOR / утечка данных', bounty: 'до 150 000 ₽' },
      { vuln: 'Auth bypass', bounty: 'до 120 000 ₽' },
      { vuln: 'XSS', bounty: 'до 60 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 40 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Максимальная сумма — для server-side без brute-force.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'vk',
    company: 'VK',
    parentCompany: 'VK',
    logo: 'V',
    logoImg: asset('/images/targets/vk.svg'),
    description: 'Экосистема сервисов: соцсеть, почта, RuStore, VK Cloud, музыка, видео. Широкий scope веб и мобильных платформ.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2022-11-15',
    editedAt: '2026-07-08',
    responseTime: '3 рабочих дня',
    rewardTime: 'до 10 рабочих дней',
    maxBounty: '200 000 ₽',
    reportsAccepted: 238,
    scope: {
      domains: ['vk.com', 'api.vk.com', 'rustore.ru', 'vk.cloud', 'dev.vk.com'],
      platforms: ['Web', 'Mobile'],
      docs: ['https://dev.vk.com/']
    },
    important: [
      'Скриншот обязателен.',
      'Отчёты сотрудников VK (до 1 года после увольнения) принимаются без выплаты.',
      'При RCE/SQLi/LFI/SSTI — минимальный PoC.'
    ],
    outOfScope: [
      'Отчёты от AI и сканеров без PoC',
      'Уязвимости на демо-стендах',
      'DoS',
      'CSRF logout',
      'Открытые редиректы без impact',
      'CSP-related баги',
      'Phishing',
      'Уязвимости устаревших ОС'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 200 000 ₽' },
      { vuln: 'SQLi / SSTI', bounty: 'до 150 000 ₽' },
      { vuln: 'LFR / XXE', bounty: 'до 150 000 ₽' },
      { vuln: 'SSRF', bounty: 'до 100 000 ₽' },
      { vuln: 'IDOR / утечка данных', bounty: 'до 80 000 ₽' },
      { vuln: 'XSS', bounty: 'до 60 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 40 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.',
      'AI-агентам запрещён поиск уязвимостей.'
    ]
  },
  {
    slug: 'wildberries',
    company: 'Wildberries',
    parentCompany: 'Wildberries',
    logo: 'W',
    logoImg: asset('/images/targets/wildberries.svg'),
    description: 'Крупнейший маркетплейс СНГ. Веб-сайт, мобильные приложения, seller-портал, складская логистика.',
    languages: ['Русский'],
    status: 'active',
    launchedAt: '2024-01-15',
    editedAt: '2026-06-28',
    responseTime: '5 рабочих дней',
    rewardTime: 'до 14 рабочих дней',
    maxBounty: '150 000 ₽',
    reportsAccepted: 65,
    scope: {
      domains: ['wildberries.ru', 'api.wildberries.ru', 'seller.wildberries.ru'],
      platforms: ['Web', 'API'],
      docs: ['https://seller.wildberries.ru/']
    },
    important: [
      'Скриншоты обязательны.',
      'Тестируйте на своих аккаунтах и товарах.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Self-XSS',
      'Уязвимости сторонних сервисов'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 150 000 ₽' },
      { vuln: 'SQLi', bounty: 'до 100 000 ₽' },
      { vuln: 'IDOR', bounty: 'до 70 000 ₽' },
      { vuln: 'XSS', bounty: 'до 30 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 20 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'avito',
    company: 'Avito',
    parentCompany: 'Avito',
    logo: 'A',
    logoImg: asset('/images/targets/avito.svg'),
    description: 'Платформа объявлений и услуг. Веб-сайт, мобильные приложения, API, платёжные сервисы Avito Pay.',
    languages: ['Русский'],
    status: 'active',
    launchedAt: '2023-11-01',
    editedAt: '2026-07-02',
    responseTime: '3 рабочих дня',
    rewardTime: 'до 10 рабочих дней',
    maxBounty: '180 000 ₽',
    reportsAccepted: 73,
    scope: {
      domains: ['avito.ru', 'api.avito.ru', 'pay.avito.ru'],
      platforms: ['Web', 'Mobile', 'API'],
      docs: ['https://www.avito.ru/help']
    },
    important: [
      'Скриншоты обязательны.',
      'Тесты только на своих объявлениях и аккаунтах.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Self-XSS',
      'Missing headers без impact'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 180 000 ₽' },
      { vuln: 'SQLi', bounty: 'до 120 000 ₽' },
      { vuln: 'IDOR', bounty: 'до 80 000 ₽' },
      { vuln: 'XSS', bounty: 'до 40 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 25 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'tinkoff',
    company: 'Тинькофф',
    parentCompany: 'Т-Технологии',
    logo: 'Т',
    logoImg: asset('/images/targets/tinkoff.svg'),
    description: 'Финтех-платформа: банк, инвестиции, бизнес-сервисы, экосистема приложений.',
    languages: ['Русский'],
    status: 'active',
    launchedAt: '2023-04-20',
    editedAt: '2026-06-30',
    responseTime: '2 рабочих дня',
    rewardTime: 'до 7 рабочих дней',
    maxBounty: '350 000 ₽',
    reportsAccepted: 112,
    scope: {
      domains: ['tinkoff.ru', 'api.tinkoff.ru', 'business.tinkoff.ru', 'invest.tinkoff.ru'],
      platforms: ['Web', 'API', 'Mobile'],
      docs: ['https://www.tinkoff.ru/business/help/']
    },
    important: [
      'Скриншоты обязательны.',
      'Тесты на своих аккаунтах.',
      'Лимит: 10 запросов/сек.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Открытые редиректы без impact',
      'Phishing'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 350 000 ₽' },
      { vuln: 'SQLi / SSTI', bounty: 'до 200 000 ₽' },
      { vuln: 'IDOR / утечка данных', bounty: 'до 130 000 ₽' },
      { vuln: 'XSS', bounty: 'до 50 000 ₽' },
      { vuln: 'CSRF', bounty: 'до 30 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'gazprom-neo',
    company: 'Газпром Neo',
    parentCompany: 'Газпром нефть',
    logo: 'Г',
    logoImg: asset('/images/targets/gazprom-neo.png'),
    description: 'Цифровая платформа нефтегазовой компании: корпоративные сервисы, API, инфраструктура.',
    languages: ['Русский'],
    status: 'closed',
    launchedAt: '2024-02-01',
    editedAt: '2026-06-15',
    responseTime: '5 рабочих дней',
    rewardTime: 'до 14 рабочих дней',
    maxBounty: '280 000 ₽',
    reportsAccepted: 34,
    scope: {
      domains: ['gazprom-neo.ru', 'api.gazprom-neo.ru'],
      platforms: ['Web', 'Infra', 'API'],
      docs: ['https://www.gazprom-neo.ru/']
    },
    important: [
      'Скриншоты обязательны.',
      'Не затрагивайте производственные системы.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Phishing',
      'Уязвимости сторонних сервисов'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 280 000 ₽' },
      { vuln: 'SQLi', bounty: 'до 150 000 ₽' },
      { vuln: 'IDOR', bounty: 'до 100 000 ₽' },
      { vuln: 'XSS', bounty: 'до 35 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'bitget-ru',
    company: 'BitGet RU',
    parentCompany: 'BitGet',
    logo: 'B',
    logoImg: asset('/images/targets/bitget.svg'),
    description: 'Криптовалютная биржа: торговый API, смарт-контракты, веб-платформа, мобильные приложения.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2024-03-10',
    editedAt: '2026-07-03',
    responseTime: '2 рабочих дня',
    rewardTime: 'до 5 рабочих дней',
    maxBounty: '450 000 ₽',
    reportsAccepted: 22,
    scope: {
      domains: ['bitget.com', 'api.bitget.com'],
      platforms: ['API', 'Smart Contract'],
      docs: ['https://www.bitget.com/api-docs']
    },
    important: [
      'Скриншоты и PoC обязательны.',
      'Не пытайтесь эксплуатировать уязвимости на mainnet.',
      'Тесты на testnet.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Уязвимости сторонних контрактов',
      'Front-running без impact'
    ],
    rewards: [
      { vuln: 'Smart Contract RCE / drain', bounty: 'до 450 000 ₽' },
      { vuln: 'Logic flaw в ордерах', bounty: 'до 200 000 ₽' },
      { vuln: 'API auth bypass', bounty: 'до 150 000 ₽' },
      { vuln: 'Reentrancy', bounty: 'до 250 000 ₽' },
      { vuln: 'XSS', bounty: 'до 40 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Тесты на testnet.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'bybit-ru',
    company: 'Bybit RU',
    parentCompany: 'Bybit',
    logo: 'B',
    logoImg: asset('/images/targets/bybit.png'),
    description: 'Криптовалютная биржа: деривативы, спот, API, смарт-контракты, мобильные приложения.',
    languages: ['Русский', 'English'],
    status: 'active',
    launchedAt: '2024-03-15',
    editedAt: '2026-06-20',
    responseTime: '2 рабочих дня',
    rewardTime: 'до 5 рабочих дней',
    maxBounty: '500 000 ₽',
    reportsAccepted: 18,
    scope: {
      domains: ['bybit.com', 'api.bybit.com'],
      platforms: ['API', 'Web3', 'Mobile'],
      docs: ['https://bybit-exchange.github.io/docs/']
    },
    important: [
      'Скриншоты и PoC обязательны.',
      'Тесты на testnet.',
      'Не эксплуатируйте на mainnet.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Уязвимости сторонних контрактов',
      'MEV без impact'
    ],
    rewards: [
      { vuln: 'Smart Contract drain', bounty: 'до 500 000 ₽' },
      { vuln: 'Reentrancy', bounty: 'до 250 000 ₽' },
      { vuln: 'API auth bypass', bounty: 'до 180 000 ₽' },
      { vuln: 'Logic flaw', bounty: 'до 150 000 ₽' },
      { vuln: 'XSS', bounty: 'до 45 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Тесты на testnet.',
      'Публикация без согласования запрещена.'
    ]
  },
  {
    slug: 'rambler',
    company: 'Rambler',
    parentCompany: 'Rambler&Co',
    logo: 'R',
    logoImg: asset('/images/targets/rambler.svg'),
    description: 'Медиа-портал и почтовый сервис: новости, почта, игры, API.',
    languages: ['Русский'],
    status: 'closed',
    launchedAt: '2023-07-01',
    editedAt: '2026-06-10',
    responseTime: '5 рабочих дней',
    rewardTime: 'до 14 рабочих дней',
    maxBounty: '120 000 ₽',
    reportsAccepted: 45,
    scope: {
      domains: ['rambler.ru', 'api.rambler.ru', 'mail.rambler.ru'],
      platforms: ['Web', 'Infra'],
      docs: ['https://help.rambler.ru/']
    },
    important: [
      'Скриншоты обязательны.',
      'Тесты на своих аккаунтах.'
    ],
    outOfScope: [
      'Сканеры без PoC',
      'DoS',
      'Self-XSS',
      'Missing headers'
    ],
    rewards: [
      { vuln: 'RCE', bounty: 'до 120 000 ₽' },
      { vuln: 'SQLi', bounty: 'до 80 000 ₽' },
      { vuln: 'IDOR', bounty: 'до 50 000 ₽' },
      { vuln: 'XSS', bounty: 'до 25 000 ₽' }
    ],
    rules: [
      'Награды за ранее неизвестные и воспроизводимые уязвимости.',
      'Публикация без согласования запрещена.'
    ]
  }

];


// ── Generate deterministic brand color from company name ──
export function logoStyle(name) {
  if (!name) name = '?'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const h1 = Math.abs(hash) % 360
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1},65%,52%), hsl(${h2},60%,45%))`
}

// ── Render logo element: img if data-url, letter otherwise ──
export function renderLogo(program) {
  if (!program) return { letter: '?', style: {} }
  const letter = (program.logo || program.company || '?').charAt(0).toUpperCase()
  let style = {}
  if (program.logoImg) {
    return { img: program.logoImg, letter, style }
  }
  style.background = logoStyle(program.company || program.logo || letter)
  return { letter, style }
}

// ── Load / save helpers ──────────────────────────────────────
export function getAllPrograms() {
  const saved = localStorage.getItem('hackpark_programs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length) {
        // Merge logoImg from DEFAULT_PROGRAMS if missing in saved version
        for (const p of parsed) {
          if (!p.logoImg) {
            const def = DEFAULT_PROGRAMS.find(d => d.slug === p.slug);
            if (def && def.logoImg) p.logoImg = def.logoImg;
          }
        }
        return parsed;
      }
    } catch(e) {}
  }
  return DEFAULT_PROGRAMS;
}

export function getProgram(slug) {
  return getAllPrograms().find(p => p.slug === slug) || null;
}

export function savePrograms(programs) {
  localStorage.setItem('hackpark_programs', JSON.stringify(programs));
}

export function saveProgram(program) {
  const programs = getAllPrograms();
  const idx = programs.findIndex(p => p.slug === program.slug);
  if (idx >= 0) programs[idx] = program;
  else programs.push(program);
  savePrograms(programs);
}

export function deleteProgram(slug) {
  savePrograms(getAllPrograms().filter(p => p.slug !== slug));
}

export function resetPrograms() {
  localStorage.removeItem('hackpark_programs');
}

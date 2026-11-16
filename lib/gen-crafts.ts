import type { CraftLine } from "./crafts";

/**
 * Цепочки главного металла каждого яруса: от сырья до слитка, по машинам. Рецепты и цвета — из исходников
 * GT5-Unofficial 5.09.54.265 и мода-ядра GTNH. Файл собирается заново — правки вносить в scripts/gen/crafts.cjs.
 */
export const GEN_CRAFTS: readonly CraftLine[] = [
 {
  "tier": "steam",
  "metal": "бронза",
  "material": "bronze",
  "steps": [
   {
    "title": "Сплавить",
    "station": "Паровая плавильня сплавов",
    "grid": [
     [
      {
       "icon": "c-ingot-copper",
       "label": "Медь × 3",
       "count": 3
      },
      {
       "icon": "c-ingot-tin",
       "label": "Олово"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-bronze",
     "label": "Бронза × 4",
     "count": 4
    },
    "note": "Медь и олово плавят в печи из руды или пыли (AlloySmelterRecipes.java)."
   }
  ]
 },
 {
  "tier": "steam",
  "metal": "сталь",
  "material": "steel",
  "steps": [
   {
    "title": "Кокс",
    "station": "Коксовая печь",
    "grid": [
     [
      {
       "icon": "c-gem-coal",
       "label": "Уголь"
      }
     ]
    ],
    "output": {
     "icon": "c-gem-coke",
     "label": "Кокс"
    },
    "note": "90 с, заодно даёт креозот."
   },
   {
    "title": "Сталь",
    "station": "Кирпичная домна",
    "grid": [
     [
      {
       "icon": "c-ingot-iron",
       "label": "Железо"
      },
      {
       "icon": "c-gem-coke",
       "label": "Кокс × 2",
       "count": 2
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-steel",
     "label": "Сталь"
    },
    "note": "4 минуты."
   }
  ]
 },
 {
  "tier": "lv",
  "metal": "сталь",
  "material": "steel-ebf",
  "steps": [
   {
    "title": "Железная пыль",
    "station": "Дробилка LV",
    "grid": [
     [
      {
       "icon": "c-ingot-iron",
       "label": "Железо"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-iron",
     "label": "Железная пыль"
    },
    "note": "2,8 с, 4 EU/t."
   },
   {
    "title": "Углерод",
    "station": "Та же дробилка",
    "grid": [
     [
      {
       "icon": "c-gem-coal",
       "label": "Уголь"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-coal",
     "label": "Угольная пыль"
    },
    "note": "0,8 с. Угольная (и древесно-угольная) пыль годится печи как углерод. Вместе со слитком — 3,6 с работы на каждые 25 с печи: одной дробилки хватает, паровая не нужна."
   },
   {
    "title": "Кислород",
    "station": "Электролизёр LV",
    "grid": [
     [
      {
       "icon": "c-cell-water",
       "label": "Вода 1 000 л"
      },
      {
       "icon": "c-cell-empty",
       "label": "Пустая капсула × 2",
       "count": 2
      }
     ]
    ],
    "output": {
     "icon": "c-cell-oxygen",
     "label": "Кислород 1 000 л"
    },
    "note": "100 с, 30 EU/t; заодно 2 капсулы водорода. Воду качает насос LV над водоёмом — до 250 л/с, нужно 40 л/с. Печи нужно 1000 л на слиток каждые 25 с — это 4 электролизёра без остановки."
   },
   {
    "title": "Сталь",
    "station": "Электрическая доменная печь, 1000 K",
    "grid": [
     [
      {
       "icon": "c-dust-iron",
       "label": "Железная пыль"
      },
      {
       "icon": "c-dust-coal",
       "label": "Угольная пыль"
      },
      {
       "icon": "c-cell-oxygen",
       "label": "Кислород 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-steel",
     "label": "Сталь"
    },
    "note": "25 с, 120 EU/t (мод-ядро); заодно 250 л углекислого газа и изредка зола. Без электричества ту же сталь дают 10 кирпичных домн — вкладка на странице стали."
   }
  ]
 },
 {
  "tier": "mv",
  "metal": "алюминий",
  "material": "aluminium",
  "steps": [
   {
    "title": "Оксид алюминия",
    "station": "Электрическая доменная печь, 1200 K",
    "grid": [
     [
      {
       "icon": "c-dust-ruby",
       "label": "Рубиновая пыль × 3",
       "count": 3
      }
     ]
    ],
    "output": {
     "icon": "c-dust-alumina",
     "label": "Оксид алюминия"
    },
    "note": "60 с, MV. Годится и сапфир, а на HV — бокситовая линия (мод-ядро, BlastFurnaceRecipes.java)."
   },
   {
    "title": "Алюминий",
    "station": "Электрическая доменная печь, 2054 K",
    "grid": [
     [
      {
       "icon": "c-dust-alumina",
       "label": "Оксид алюминия × 10",
       "count": 10
      },
      {
       "icon": "c-dust-carbon",
       "label": "Углерод × 3",
       "count": 3
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-aluminium",
     "label": "Алюминий × 4",
     "count": 4
    },
    "note": "60 с, MV; выходят сразу холодные слитки. Сама линия ниже плавит алюминиевую пыль — это второй путь."
   }
  ]
 },
 {
  "tier": "hv",
  "metal": "нержавеющая сталь",
  "material": "stainless-steel",
  "steps": [
   {
    "title": "Инвар",
    "station": "Смеситель",
    "grid": [
     [
      {
       "icon": "c-dust-iron",
       "label": "Железная пыль × 2",
       "count": 2
      },
      {
       "icon": "c-dust-nickel",
       "label": "Никель"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-invar",
     "label": "Инвар × 3",
     "count": 3
    },
    "note": "15 с (MixerRecipes.java)."
   },
   {
    "title": "Пыль нержавейки",
    "station": "Смеситель",
    "grid": [
     [
      {
       "icon": "c-dust-iron",
       "label": "Железная пыль × 4",
       "count": 4
      },
      {
       "icon": "c-dust-invar",
       "label": "Инвар × 3",
       "count": 3
      },
      {
       "icon": "c-dust-manganese",
       "label": "Марганец"
      }
     ],
     [
      {
       "icon": "c-dust-chrome",
       "label": "Хром"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-stainless",
     "label": "Пыль нержавеющей стали × 9",
     "count": 9
    },
    "note": "45 с, MV."
   },
   {
    "title": "Нержавеющая сталь",
    "station": "Электрическая доменная печь, 1700 K",
    "grid": [
     [
      {
       "icon": "c-dust-stainless",
       "label": "Пыль нержавеющей стали"
      },
      {
       "icon": "c-cell-oxygen",
       "label": "Кислород 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-stainless",
     "label": "Нержавеющая сталь"
    },
    "note": "60 с, HV; слиток выходит холодным."
   }
  ]
 },
 {
  "tier": "ev",
  "metal": "титан",
  "material": "titanium",
  "steps": [
   {
    "title": "Рутил",
    "station": "Химическая ванна",
    "grid": [
     [
      {
       "icon": "c-crushed-ilmenite",
       "label": "Очищенный дроблёный ильменит"
      },
      {
       "icon": "c-cell-sulfuric",
       "label": "Серная кислота 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-rutile",
     "label": "Рутил × 2",
     "count": 2
    },
    "note": "21 с. Рутил даёт и бокситовая линия (ChemicalBathRecipes.java)."
   },
   {
    "title": "Тетрахлорид титана",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-rutile",
       "label": "Рутил × 3",
       "count": 3
      },
      {
       "icon": "c-dust-carbon",
       "label": "Углерод × 2",
       "count": 2
      },
      {
       "icon": "c-cell-chlorine",
       "label": "Хлор 4 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-ticl4",
     "label": "Тетрахлорид титана 1 000 л"
    },
    "note": "20 с, HV (ChemicalRecipes.java)."
   },
   {
    "title": "Вернуть магний",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-sodium",
       "label": "Натрий × 4",
       "count": 4
      },
      {
       "icon": "c-dust-mgcl2",
       "label": "Хлорид магния × 6",
       "count": 6
      }
     ]
    ],
    "output": {
     "icon": "c-dust-magnesium",
     "label": "Магний × 2",
     "count": 2
    },
    "note": "20 с, HV; заодно 8 соли. Хлорид магния выходит из печи на следующем шаге — так магний ходит по кругу."
   },
   {
    "title": "Титан (процесс Кролля)",
    "station": "Электрическая доменная печь, 2140 K",
    "grid": [
     [
      {
       "icon": "c-dust-magnesium",
       "label": "Магний × 2",
       "count": 2
      },
      {
       "icon": "c-cell-ticl4",
       "label": "Тетрахлорид титана 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-hot-titanium",
     "label": "Раскалённый титан"
    },
    "note": "40 с — это шаг линии ниже; заодно 6 хлорида магния (мод-ядро, BlastFurnaceRecipes.java)."
   },
   {
    "title": "Остудить",
    "station": "Вакуумный морозильник",
    "grid": [
     [
      {
       "icon": "c-hot-titanium",
       "label": "Раскалённый титан"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-titanium",
     "label": "Титан"
    }
   }
  ]
 },
 {
  "tier": "iv",
  "metal": "вольфрамовая сталь",
  "material": "tungstensteel",
  "steps": [
   {
    "title": "Вольфрамовая кислота",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-scheelite",
       "label": "Шеелит × 6",
       "count": 6
      },
      {
       "icon": "c-cell-hcl",
       "label": "Соляная кислота 2 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-tungstic",
     "label": "Вольфрамовая кислота × 7",
     "count": 7
    },
    "note": "2,5 с, EV (BotRecipes.java)."
   },
   {
    "title": "Триоксид вольфрама",
    "station": "Электрическая доменная печь, 1200 K",
    "grid": [
     [
      {
       "icon": "c-dust-tungstic",
       "label": "Вольфрамовая кислота × 7",
       "count": 7
      }
     ]
    ],
    "output": {
     "icon": "c-dust-wo3",
     "label": "Триоксид вольфрама × 4",
     "count": 4
    },
    "note": "10 с, HV."
   },
   {
    "title": "Вольфрам",
    "station": "Электрическая доменная печь, 1000 K",
    "grid": [
     [
      {
       "icon": "c-dust-wo3",
       "label": "Триоксид вольфрама × 4",
       "count": 4
      },
      {
       "icon": "c-cell-hydrogen",
       "label": "Водород 6 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-tungsten",
     "label": "Вольфрам"
    },
    "note": "5 с, HV; заодно пар."
   },
   {
    "title": "Пыль вольфрамовой стали",
    "station": "Смеситель",
    "grid": [
     [
      {
       "icon": "c-dust-tungsten",
       "label": "Вольфрам"
      },
      {
       "icon": "c-dust-steel",
       "label": "Стальная пыль"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-wsteel",
     "label": "Пыль вольфрамовой стали × 2",
     "count": 2
    },
    "note": "2,5 с, EV."
   },
   {
    "title": "Вольфрамовая сталь",
    "station": "Электрическая доменная печь, 4000 K",
    "grid": [
     [
      {
       "icon": "c-dust-wsteel",
       "label": "Пыль вольфрамовой стали"
      }
     ]
    ],
    "output": {
     "icon": "c-hot-wsteel",
     "label": "Раскалённая вольфрамовая сталь"
    },
    "note": "125 с — это шаг линии ниже."
   },
   {
    "title": "Остудить",
    "station": "Вакуумный морозильник",
    "grid": [
     [
      {
       "icon": "c-hot-wsteel",
       "label": "Раскалённая вольфрамовая сталь"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-wsteel",
     "label": "Вольфрамовая сталь"
    }
   }
  ]
 },
 {
  "tier": "luv",
  "metal": "палладий с родиевым покрытием",
  "material": "rhodium-plated-palladium",
  "steps": [
   {
    "title": "Растворить руду",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-crushed-chalcopyrite",
       "label": "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит"
      },
      {
       "icon": "c-cell-aquaregia",
       "label": "Царская водка 300 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-ptconc",
     "label": "Платиновый концентрат 300 л"
    },
    "note": "Царскую водку мешают в смесителе: 3 соляной кислоты на 1 азотную (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Палладий в аммиаке",
    "station": "Центрифуга",
    "grid": [
     [
      {
       "icon": "c-cell-ptconc",
       "label": "Платиновый концентрат × 4",
       "count": 4
      },
      {
       "icon": "c-cell-nh4cl",
       "label": "Хлорид аммония 400 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-pdammonia",
     "label": "Палладий в аммиаке 400 л"
    },
    "note": "64 с; заодно сырая соль платины."
   },
   {
    "title": "Осаждённый палладий",
    "station": "Химический реактор и просеиватель",
    "grid": [
     [
      {
       "icon": "c-cell-pdammonia",
       "label": "Палладий в аммиаке 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-pdraw",
     "label": "Осаждённый палладий × 2",
     "count": 2
    },
    "note": "Три шага: реактор делает соль палладия, просеиватель — металлический порошок, реактор с аммиаком палладия — осаждённый палладий."
   },
   {
    "title": "Палладий",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-pdraw",
       "label": "Осаждённый палладий × 4",
       "count": 4
      },
      {
       "icon": "c-cell-formic",
       "label": "Муравьиная кислота 4 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-palladium",
     "label": "Палладий × 2",
     "count": 2
    },
    "note": "12,5 с (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Родий",
    "station": "Печь, реакторы, смеситель, просеиватель",
    "grid": [
     [
      {
       "icon": "c-cell-rhsulfate",
       "label": "Сульфат родия"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-rhodium",
     "label": "Родий"
    },
    "note": "Сульфат родия выходит при выщелачивании платинового остатка. Дальше: вода, цинк, печь с солью и хлором, селитра, просеиватель, вода и соляная кислота — около десяти шагов."
   },
   {
    "title": "Смешать",
    "station": "Смеситель",
    "grid": [
     [
      {
       "icon": "c-dust-palladium",
       "label": "Палладий × 3",
       "count": 3
      },
      {
       "icon": "c-dust-rhodium",
       "label": "Родий"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-rpp",
     "label": "Пыль палладия с родиевым покрытием × 4",
     "count": 4
    },
    "note": "EV."
   },
   {
    "title": "Плавка",
    "station": "Электрическая доменная печь, 4500 K",
    "grid": [
     [
      {
       "icon": "c-dust-rpp",
       "label": "Пыль палладия с родиевым покрытием"
      }
     ]
    ],
    "output": {
     "icon": "c-hot-rpp",
     "label": "Раскалённый палладий с родиевым покрытием"
    },
    "note": "450 с — это шаг линии ниже."
   },
   {
    "title": "Остудить",
    "station": "Вакуумный морозильник",
    "grid": [
     [
      {
       "icon": "c-hot-rpp",
       "label": "Раскалённый палладий с родиевым покрытием"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-rpp",
     "label": "Палладий с родиевым покрытием"
    }
   }
  ]
 },
 {
  "tier": "zpm",
  "metal": "иридий",
  "material": "iridium",
  "steps": [
   {
    "title": "Растворить руду",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-crushed-chalcopyrite",
       "label": "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит"
      },
      {
       "icon": "c-cell-aquaregia",
       "label": "Царская водка 300 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-ptconc",
     "label": "Платиновый концентрат 300 л"
    },
    "note": "Царскую водку мешают в смесителе: 3 соляной кислоты на 1 азотную (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Платиновый остаток",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-crushed-chalcopyrite",
       "label": "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит × 9",
       "count": 9
      },
      {
       "icon": "c-dust-ptmetal",
       "label": "Металлический порошок платины × 9",
       "count": 9
      },
      {
       "icon": "c-cell-aquaregia",
       "label": "Царская водка 20 700 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-ptresidue",
     "label": "Платиновый остаток"
    },
    "note": "Порошок платины получают из того же концентрата: центрифуга, просеиватель и печь на 900 K. Вместе с рудой его снова растворяют — остаётся платиновый остаток."
   },
   {
    "title": "Выщелочить",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-ptresidue",
       "label": "Платиновый остаток"
      },
      {
       "icon": "c-cell-k2s2o7",
       "label": "Расплав дисульфата калия 360 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-leach",
     "label": "Выщелоченный остаток"
    },
    "note": "Заодно выходит 360 л сульфата родия."
   },
   {
    "title": "Остаток редчайших металлов",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-leach",
       "label": "Выщелоченный остаток × 10",
       "count": 10
      },
      {
       "icon": "c-dust-saltpeter",
       "label": "Селитра × 10",
       "count": 10
      },
      {
       "icon": "c-cell-saltwater",
       "label": "Солёная вода 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-rarest",
     "label": "Остаток редчайших металлов × 6",
     "count": 6
    }
   },
   {
    "title": "Разделить иридий и осмий",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-rarest",
       "label": "Остаток редчайших металлов × 2",
       "count": 2
      },
      {
       "icon": "c-cell-hcl",
       "label": "Соляная кислота 500 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-irresidue",
     "label": "Иридиевый остаток"
    },
    "note": "Заодно выходит 1000 л кислого раствора осмия."
   },
   {
    "title": "Диоксид иридия",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-irresidue",
       "label": "Иридиевый остаток"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-iro2",
     "label": "Диоксид иридия"
    },
    "note": "10 с, MV."
   },
   {
    "title": "Кислый раствор",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-iro2",
       "label": "Диоксид иридия"
      },
      {
       "icon": "c-cell-hcl",
       "label": "Соляная кислота 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-iracid",
     "label": "Кислый раствор иридия 1 000 л"
    }
   },
   {
    "title": "Хлорид иридия",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-cell-iracid",
       "label": "Кислый раствор иридия 1 000 л"
      },
      {
       "icon": "c-cell-nh4cl",
       "label": "Хлорид аммония 3 000 л",
       "count": 3
      }
     ]
    ],
    "output": {
     "icon": "c-dust-ircl",
     "label": "Хлорид иридия"
    }
   },
   {
    "title": "Иридий",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-ircl",
       "label": "Хлорид иридия"
      },
      {
       "icon": "c-dust-calcium",
       "label": "Кальций"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-iridium",
     "label": "Иридий"
    },
    "note": "15 с, EV (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Плавка",
    "station": "Электрическая доменная печь, 4500 K",
    "grid": [
     [
      {
       "icon": "c-dust-iridium",
       "label": "Иридий"
      }
     ]
    ],
    "output": {
     "icon": "c-hot-iridium",
     "label": "Раскалённый иридий"
    },
    "note": "Шаг линии ниже."
   },
   {
    "title": "Остудить",
    "station": "Вакуумный морозильник",
    "grid": [
     [
      {
       "icon": "c-hot-iridium",
       "label": "Раскалённый иридий"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-iridium",
     "label": "Иридий"
    }
   }
  ]
 },
 {
  "tier": "uv",
  "metal": "осмий",
  "material": "osmium",
  "steps": [
   {
    "title": "Растворить руду",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-crushed-chalcopyrite",
       "label": "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит"
      },
      {
       "icon": "c-cell-aquaregia",
       "label": "Царская водка 300 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-ptconc",
     "label": "Платиновый концентрат 300 л"
    },
    "note": "Царскую водку мешают в смесителе: 3 соляной кислоты на 1 азотную (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Платиновый остаток",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-crushed-chalcopyrite",
       "label": "Очищенная дроблёная руда: халькопирит, пентландит, тетраэдрит или куперит × 9",
       "count": 9
      },
      {
       "icon": "c-dust-ptmetal",
       "label": "Металлический порошок платины × 9",
       "count": 9
      },
      {
       "icon": "c-cell-aquaregia",
       "label": "Царская водка 20 700 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-ptresidue",
     "label": "Платиновый остаток"
    },
    "note": "Порошок платины получают из того же концентрата: центрифуга, просеиватель и печь на 900 K. Вместе с рудой его снова растворяют — остаётся платиновый остаток."
   },
   {
    "title": "Выщелочить",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-ptresidue",
       "label": "Платиновый остаток"
      },
      {
       "icon": "c-cell-k2s2o7",
       "label": "Расплав дисульфата калия 360 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-leach",
     "label": "Выщелоченный остаток"
    },
    "note": "Заодно выходит 360 л сульфата родия."
   },
   {
    "title": "Остаток редчайших металлов",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-leach",
       "label": "Выщелоченный остаток × 10",
       "count": 10
      },
      {
       "icon": "c-dust-saltpeter",
       "label": "Селитра × 10",
       "count": 10
      },
      {
       "icon": "c-cell-saltwater",
       "label": "Солёная вода 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-rarest",
     "label": "Остаток редчайших металлов × 6",
     "count": 6
    }
   },
   {
    "title": "Разделить иридий и осмий",
    "station": "Электрическая доменная печь, 775 K",
    "grid": [
     [
      {
       "icon": "c-dust-rarest",
       "label": "Остаток редчайших металлов × 2",
       "count": 2
      },
      {
       "icon": "c-cell-hcl",
       "label": "Соляная кислота 500 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-irresidue",
     "label": "Иридиевый остаток"
    },
    "note": "Заодно выходит 1000 л кислого раствора осмия."
   },
   {
    "title": "Раствор осмия",
    "station": "Дистилляционная колонна",
    "grid": [
     [
      {
       "icon": "c-cell-osacid",
       "label": "Кислый раствор осмия 1 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-ossolution",
     "label": "Раствор осмия 100 л"
    },
    "note": "7,5 с, IV; остальное — вода."
   },
   {
    "title": "Осмий",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-cell-ossolution",
       "label": "Раствор осмия"
      },
      {
       "icon": "c-cell-hcl",
       "label": "Соляная кислота × 6",
       "count": 6
      }
     ]
    ],
    "output": {
     "icon": "c-dust-osmium",
     "label": "Осмий"
    },
    "note": "15 с (PlatinumSludgeRecipes.java)."
   },
   {
    "title": "Плавка",
    "station": "Электрическая доменная печь, 4500 K",
    "grid": [
     [
      {
       "icon": "c-dust-osmium",
       "label": "Осмий"
      }
     ]
    ],
    "output": {
     "icon": "c-hot-osmium",
     "label": "Раскалённый осмий"
    },
    "note": "Шаг линии ниже."
   },
   {
    "title": "Остудить",
    "station": "Вакуумный морозильник",
    "grid": [
     [
      {
       "icon": "c-hot-osmium",
       "label": "Раскалённый осмий"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-osmium",
     "label": "Осмий"
    }
   }
  ]
 },
 {
  "tier": "uhv",
  "metal": "нейтроний",
  "material": "neutronium",
  "steps": [
   {
    "title": "Америций",
    "station": "Термоядерный реактор",
    "grid": [
     [
      {
       "icon": "c-cell-lutetium",
       "label": "Жидкий лютеций 16 л"
      },
      {
       "icon": "c-cell-chrome",
       "label": "Жидкий хром 16 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-americium",
     "label": "Жидкий америций 16 л"
    },
    "note": "4,8 с (FusionReactorRecipes.java)."
   },
   {
    "title": "Фосфат наквадрии",
    "station": "Центрифуга",
    "grid": [
     [
      {
       "icon": "c-dust-nqearth",
       "label": "Наквадриевая земля × 4",
       "count": 4
      },
      {
       "icon": "c-cell-phosphoric",
       "label": "Фосфорная кислота 4 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-nqphosphate",
     "label": "Фосфат наквадрии × 4",
     "count": 4
    },
    "note": "20 с, ZPM. Наквадриевую землю дают перемолотые массы наквады (NaquadahRecipeLoader.java)."
   },
   {
    "title": "Раствор наквадрии",
    "station": "Химический реактор",
    "grid": [
     [
      {
       "icon": "c-dust-nqphosphate",
       "label": "Фосфат наквадрии × 10",
       "count": 10
      },
      {
       "icon": "c-cell-sulfuric",
       "label": "Серная кислота × 30",
       "count": 30
      }
     ]
    ],
    "output": {
     "icon": "c-cell-nqsolution",
     "label": "Раствор, богатый наквадрией 9 000 л"
    },
    "note": "50 с, IV."
   },
   {
    "title": "Сульфат наквадрии",
    "station": "Нейтронный активатор",
    "grid": [
     [
      {
       "icon": "c-cell-nqsolution",
       "label": "Раствор, богатый наквадрией 9 000 л"
      }
     ]
    ],
    "output": {
     "icon": "c-dust-nqsulphate",
     "label": "Сульфат наквадрии × 44",
     "count": 44
    },
    "note": "5 с при 1050–1100 МэВ."
   },
   {
    "title": "Наквадрия",
    "station": "Электрическая доменная печь, 9100 K",
    "grid": [
     [
      {
       "icon": "c-dust-nqsulphate",
       "label": "Сульфат наквадрии × 11",
       "count": 11
      },
      {
       "icon": "c-dust-magnesium",
       "label": "Магний × 2",
       "count": 2
      }
     ]
    ],
    "output": {
     "icon": "c-cell-naquadria",
     "label": "Жидкая наквадрия 144 л"
    },
    "note": "Выходит раскалённый слиток: его остужают в морозильнике и плавят в жидкость."
   },
   {
    "title": "Нейтроний",
    "station": "Реактор синтеза III",
    "grid": [
     [
      {
       "icon": "c-cell-americium",
       "label": "Жидкий америций 144 л"
      },
      {
       "icon": "c-cell-naquadria",
       "label": "Жидкая наквадрия 144 л"
      }
     ]
    ],
    "output": {
     "icon": "c-cell-neutronium",
     "label": "Жидкий нейтроний 144 л"
    },
    "note": "12 с — это шаг линии ниже."
   },
   {
    "title": "Отлить слиток",
    "station": "Жидкостный отвердитель",
    "grid": [
     [
      {
       "icon": "c-cell-neutronium",
       "label": "Жидкий нейтроний 144 л"
      }
     ]
    ],
    "output": {
     "icon": "c-ingot-neutronium",
     "label": "Нейтроний"
    }
   }
  ]
 }
];

// Постройки из блоков Minecraft и Forestry: на сайте эти блоки — свои рисунки (scripts/own-blocks.mjs).
const tip = (title, text) => ({ title, text });
const own = (name) => ({ type: "own", name });
module.exports = [
  {
    cls: "MTEWindmill", slug: "windmill", tier: "steam", name: "Windmill", title: "Ветряная мельница",
    summary: "Мелет руду силой ветра — без пара и без электричества.",
    story: [
      "Ветряная мельница мелет предметы силой ветра: ей не нужны ни пар, ни электричество. Вики относит её к каменному веку — это самая ранняя постройка, которая умеет дробить.",
      "Основание — из кирпичей, башня — из обожжённой глины, верх — из досок. В блок ротора наверху ставят ротор: от него зависит скорость, и он понемногу изнашивается.",
    ],
    elements: {
      p: own("planks"), c: own("clay"), d: own("clay"), b: own("bricks"),
      r: { type: "block", file: "bartworks/textures/blocks/BWRotorBlock", label: "Блок ротора" },
    },
    tips: [tip("Ротор", "Без ротора в блоке ротора мельница стоит; роторы бывают разной прочности."), tip("Ветер", "Слишком слабый или слишком сильный ветер останавливает мельницу.")],
  },
  {
    cls: "MTECharcoalPit", slug: "charcoal-pile-igniter", tier: "steam", name: "Charcoal Pile Igniter", title: "Поджигатель угольной ямы",
    summary: "Пережигает кучу брёвен под землёй в древесный уголь.",
    story: [
      "Поджигатель угольной ямы превращает брёвна под собой в хрупкий древесный уголь. Брёвна кладут кучей: снизу — кирпичи, по бокам и сверху — земля, а сам поджигатель стоит сверху посередине.",
      "Куча может быть разного размера — до 11 × 5 × 11 брёвен. Здесь показана маленькая: три на три и два слоя.",
    ],
    layers: [
      ["     ", " DDD ", " D~D ", " DDD ", "     "],
      ["DDDDD", "DLLLD", "DLLLD", "DLLLD", "DDDDD"],
      ["DDDDD", "DLLLD", "DLLLD", "DLLLD", "DDDDD"],
      ["     ", " BBB ", " BBB ", " BBB ", "     "],
    ],
    elements: { D: own("dirt"), L: own("log"), B: own("bricks") },
    controllerBase: { type: "block", file: "gregtech/textures/blocks/iconsets/MACHINE_BRONZEPLATEDBRICKS", label: "Бронзовая обшивка с кирпичами" },
    overlay: "gregtech/textures/blocks/iconsets/OVERLAY_CHARCOAL_PIT",
    facingUp: true,
    tips: [tip("Поджечь", "Яму поджигают огнивом, кликнув по поджигателю."), tip("Дым", "Пока яма горит, она загрязняет воздух.")],
  },
  {
    cls: "MTEMegaIndustrialApiary", slug: "mega-apiary", tier: "uv", title: "Мега-пасека",
    summary: "Тысячи пчёл в одной постройке: мёд и соты без сотен ульев.",
    story: [
      "Мега-пасека (в игре её имя сокращают до IAADDS) держит пчелиных маток внутри контроллера и собирает их продукты — вместо сотен промышленных пасек. Это бережёт сервер.",
      "Постройка — большой купол из стекла, досок и блоков пасеки мода Forestry; внутри — земля, вода и цветы для пчёл. Цветы на сайте не показаны.",
    ],
    elements: { H: own("planks"), I: own("planks"), J: own("hive"), K: own("hive"), L: own("hive"), N: own("hive"), O: own("hive"), P: own("hive"), F: { type: "air" } },
    tips: [tip("Матки", "Маток кладут и забирают через контроллер в особом режиме."), tip("Цветы", "Пчёлам нужны их цветы внутри купола — как в обычной пасеке.")],
  },
];

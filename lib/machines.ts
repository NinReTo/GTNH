import { ASSETS } from "./config";
import type { TierId } from "./tiers";
import { HIGH_MACHINES } from "./machines-high";
import { GEN_KINDS } from "./gen-kinds";
import { GEN_MACHINES } from "./gen-machines";
import { buildStructure, type BlockKind, type Structure, type StructureDef } from "./structure";

/**
 * Справочник видов блоков. texture — имя файла в public/textures/gregtech,
 * все файлы получены из текстур мода скриптом scripts/fetch-textures.mjs.
 */
export const KINDS = {
  // Электрическая доменная печь
  heatproof: { label: "Жаропрочный корпус", texture: "casing" },
  coil: { label: "Нагревательная катушка", texture: "coil-cupronickel", isHot: true },
  ebfController: { label: "Контроллер", texture: "controller", glow: "controller-glow", face: { rule: "front", base: "casing" } },
  muffler: { label: "Глушитель", texture: "muffler", face: { rule: "up", base: "casing" } },
  inputBus: { label: "Входная шина", texture: "input-bus", face: { rule: "outward", base: "casing" } },
  outputBus: { label: "Выходная шина", texture: "output-bus", face: { rule: "outward", base: "casing" } },
  inputHatch: { label: "Входной люк", texture: "input-hatch", face: { rule: "outward", base: "casing" } },
  // Выход жидкости у постройки калькулятора; рисунок — люк ректификационной колонны (он же обычный выходной люк GregTech).
  outputHatch: { label: "Выходной люк", texture: "dt-output-hatch", face: { rule: "outward", base: "casing" } },
  energy: { label: "Энергетический люк", texture: "energy", face: { rule: "outward", base: "casing" } },
  maintenance: { label: "Люк обслуживания", texture: "maintenance", face: { rule: "outward", base: "casing" } },

  // Кирпичные печи
  firebrick: { label: "Огнеупорный кирпич", texture: "firebrick", isMatte: true },
  bbfController: { label: "Контроллер", texture: "bbf-controller", glow: "bbf-controller-glow", face: { rule: "front", base: "firebrick" }, isMatte: true },
  cokeBrick: { label: "Кирпич коксовой печи", texture: "coke-brick", isMatte: true },
  cokeController: { label: "Контроллер", texture: "coke-controller", glow: "coke-controller-glow", face: { rule: "front", base: "coke-brick" }, isMatte: true },

  // Паровые постройки, бронзовый ярус
  bronzeBricks: { label: "Бронзовые кирпичи", texture: "bronze-bricks", isMatte: true },
  bronzeGearbox: { label: "Бронзовый редуктор", texture: "bronze-gearbox" },
  bronzePipe: { label: "Бронзовый трубный корпус", texture: "bronze-pipe" },
  bronzeFirebox: { label: "Бронзовая топка", texture: "bronze-firebox" },
  bronzeFrame: { label: "Бронзовая рама", texture: "bronze-frame", isCutout: true },
  ironBlock: { label: "Блок железа", texture: "iron-block" },
  glass: { label: "Стекло", texture: "glass", isGlass: true },
  wood: { label: "Деревянный корпус", texture: "wood", isMatte: true },
  waterTankSiding: { label: "Стенка водяного бака", texture: "water-tank", isMatte: true },
  maceratorController: { label: "Контроллер", texture: "macerator-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  furnaceController: { label: "Контроллер", texture: "furnace-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  compressorController: { label: "Контроллер", texture: "compressor-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  smelterController: { label: "Контроллер", texture: "smelter-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  hammerController: { label: "Контроллер", texture: "hammer-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  pumpController: { label: "Контроллер", texture: "pump-controller", face: { rule: "front", base: "wood" }, isMatte: true },
  // Смеситель в моде носит тот же значок контроллера, что и сепаратор.
  separatorController: { label: "Контроллер", texture: "separator-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  purifierController: { label: "Контроллер", texture: "purifier-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },

  // Котёл Railcraft: блоки нарисованы заново (лицензия Railcraft не разрешает брать его текстуры).
  rcFirebox: { label: "Топка", texture: "rc-firebox", isMatte: true },
  rcTank: { label: "Бак котла", texture: "rc-tank" },

  // Электрический воздушный фильтр
  airCasing: { label: "Корпус турбины фильтра", texture: "air-casing" },
  airVent: { label: "Вентиляционный корпус", texture: "air-vent" },
  airController: { label: "Контроллер", texture: "air-controller", face: { rule: "front", base: "air-casing" } },
  airMuffler: { label: "Глушитель", texture: "air-muffler", face: { rule: "outward", base: "air-casing" } },
  airMaintenance: { label: "Люк обслуживания", texture: "air-maintenance", face: { rule: "outward", base: "air-casing" } },
  airEnergy: { label: "Энергетический люк", texture: "air-energy", face: { rule: "outward", base: "air-casing" } },
  airInputBus: { label: "Входная шина", texture: "air-input-bus", face: { rule: "outward", base: "air-casing" } },

  // Постройки MV
  multiSmelterController: { label: "Контроллер", texture: "multi-smelter-controller", glow: "multi-smelter-controller-glow", face: { rule: "front", base: "casing" } },
  pyroCasing: { label: "Корпус пиролизной печи", texture: "pyro-casing" },
  pyroController: { label: "Контроллер", texture: "pyro-controller", glow: "pyro-controller-glow", face: { rule: "front", base: "pyro-casing" } },
  pyroMuffler: { label: "Глушитель", texture: "pyro-muffler", face: { rule: "up", base: "pyro-casing" } },
  pyroMaintenance: { label: "Люк обслуживания", texture: "pyro-maintenance", face: { rule: "outward", base: "pyro-casing" } },
  pyroEnergy: { label: "Энергетический люк", texture: "pyro-energy", face: { rule: "outward", base: "pyro-casing" } },
  pyroOutputBus: { label: "Выходная шина", texture: "pyro-output-bus", face: { rule: "outward", base: "pyro-casing" } },
  steelPipe: { label: "Стальной трубный корпус", texture: "air-vent" },
  steelFirebox: { label: "Стальная топка", texture: "steel-firebox" },
  steelFrame: { label: "Стальная рама", texture: "steel-frame", isCutout: true },
  solidSteel: { label: "Корпус из цельной стали", texture: "solid-steel" },
  drillController: { label: "Контроллер", texture: "drill-controller", face: { rule: "front", base: "solid-steel" } },
  drillMaintenance: { label: "Люк обслуживания", texture: "drill-maintenance", face: { rule: "outward", base: "solid-steel" } },
  drillEnergy: { label: "Энергетический люк", texture: "drill-energy", face: { rule: "outward", base: "solid-steel" } },
  drillOutputHatch: { label: "Выходной люк", texture: "drill-output-hatch", face: { rule: "outward", base: "solid-steel" } },
  // GT++: химический завод и ферма водорослей
  lvCasing: { label: "Машинный корпус LV", texture: "hull-lv-side" },
  chemPlantController: { label: "Контроллер", texture: "chem-plant-controller", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },
  algaeCasing: { label: "Корпус фермы водорослей", texture: "algae-casing" },
  algaeController: { label: "Контроллер", texture: "algae-controller", face: { rule: "front", base: "algae-casing" } },
  filterCasing: { label: "Фильтр", texture: "filter-casing" },
  stainlessFrame: { label: "Рама из нержавейки", texture: "stainless-frame", isCutout: true },

  // Постройки HV
  frostProof: { label: "Морозостойкий корпус", texture: "frost-proof" },
  freezerController: { label: "Контроллер", texture: "freezer-controller", face: { rule: "front", base: "frost-proof" } },
  implosionController: { label: "Контроллер", texture: "implosion-controller", face: { rule: "front", base: "solid-steel" } },
  inertCasing: { label: "Химически стойкий корпус", texture: "inert-casing" },
  ptfePipe: { label: "Трубный корпус из тефлона", texture: "ptfe-pipe" },
  lcrController: { label: "Контроллер", texture: "lcr-controller", face: { rule: "front", base: "inert-casing" } },
  stainlessCasing: { label: "Корпус из чистой нержавейки", texture: "clean-stainless" },
  dtController: { label: "Контроллер", texture: "dt-controller", face: { rule: "front", base: "clean-stainless" } },
  dtOutputHatch: { label: "Выходной люк", texture: "dt-output-hatch", face: { rule: "outward", base: "clean-stainless" } },
  crackerController: { label: "Контроллер", texture: "cracker-controller", face: { rule: "front", base: "clean-stainless" } },
  turbineCasing: { label: "Корпус турбины", texture: "air-casing" },
  ironFrame: { label: "Железная рама", texture: "iron-frame", isCutout: true },
  turbineDynamo: { label: "Динамо-люк", texture: "turbine-dynamo", face: { rule: "outward", base: "air-casing" } },
  turbine1: { label: "Корпус турбины", texture: "turbine-1", face: { rule: "front", base: "air-casing" } },
  turbine2: { label: "Корпус турбины", texture: "turbine-2", face: { rule: "front", base: "air-casing" } },
  turbine3: { label: "Корпус турбины", texture: "turbine-3", face: { rule: "front", base: "air-casing" } },
  turbine4: { label: "Корпус турбины", texture: "turbine-4", face: { rule: "front", base: "air-casing" } },
  turbine5: { label: "Корпус турбины", texture: "turbine-5", face: { rule: "front", base: "air-casing" } },
  turbine6: { label: "Корпус турбины", texture: "turbine-6", face: { rule: "front", base: "air-casing" } },
  turbine7: { label: "Корпус турбины", texture: "turbine-7", face: { rule: "front", base: "air-casing" } },
  turbine8: { label: "Корпус турбины", texture: "turbine-8", face: { rule: "front", base: "air-casing" } },
  turbine9: { label: "Корпус турбины", texture: "turbine-9", face: { rule: "front", base: "air-casing" } },
  plascrete: { label: "Пласкрит", texture: "plascrete", isMatte: true },
  cleanroomController: { label: "Контроллер", texture: "cleanroom-controller", face: { rule: "up", base: "plascrete" }, isMatte: true },
  largeBoilerController: { label: "Контроллер", texture: "large-boiler-controller", glow: "large-boiler-controller-glow", face: { rule: "front", base: "bronze-bricks" }, isMatte: true },

  // Постройки EV
  titaniumCasing: { label: "Титановый корпус", texture: "stable-titanium" },
  titaniumGearbox: { label: "Титановый редуктор", texture: "titanium-gearbox" },
  engineIntake: { label: "Воздухозаборник", texture: "engine-intake" },
  ptfeFrame: { label: "Тефлоновая рама", texture: "ptfe-frame", isCutout: true },
  lceController: { label: "Контроллер", texture: "lce-controller", face: { rule: "front", base: "stable-titanium" } },
  lceDynamo: { label: "Динамо-люк", texture: "lce-dynamo", face: { rule: "outward", base: "inert-casing" } },
  stainlessTurbine: { label: "Корпус турбины из нержавейки", texture: "stainless-turbine" },
  tinPipe: { label: "Оловянный трубный корпус", texture: "tin-pipe" },
  gasDynamo: { label: "Динамо-люк", texture: "gas-dynamo", face: { rule: "outward", base: "stainless-turbine" } },
  gasTurbine1: { label: "Корпус турбины", texture: "gas-turbine-1", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine2: { label: "Корпус турбины", texture: "gas-turbine-2", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine3: { label: "Корпус турбины", texture: "gas-turbine-3", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine4: { label: "Корпус турбины", texture: "gas-turbine-4", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine5: { label: "Корпус турбины", texture: "gas-turbine-5", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine6: { label: "Корпус турбины", texture: "gas-turbine-6", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine7: { label: "Корпус турбины", texture: "gas-turbine-7", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine8: { label: "Корпус турбины", texture: "gas-turbine-8", face: { rule: "front", base: "stainless-turbine" } },
  gasTurbine9: { label: "Корпус турбины", texture: "gas-turbine-9", face: { rule: "front", base: "stainless-turbine" } },
  oreDrillController: { label: "Контроллер", texture: "ore-drill-controller", face: { rule: "front", base: "solid-steel" } },
  centrifugeCasing: { label: "Корпус центрифуги", texture: "centrifuge-casing" },
  sieveGrate: { label: "Решётка", texture: "sieve-grate" },
  eglinFrame: { label: "Рама из стали Эглин", texture: "eglin-frame", isCutout: true },
  centrifugeController: { label: "Контроллер", texture: "centrifuge-controller", face: { rule: "front", base: "centrifuge-casing" } },
  macStackController: { label: "Контроллер", texture: "mac-stack-controller", face: { rule: "front", base: "stable-titanium" } },
  lscBase: { label: "Корпус суперконденсатора", texture: "lsc-base" },
  lscCapacitor: { label: "Лапотронный конденсатор", texture: "lsc-capacitor" },
  lscController: { label: "Контроллер", texture: "lsc-controller", face: { rule: "front", base: "lsc-base" } },

  // Постройки IV
  assemblerCasing: { label: "Корпус сборщика", texture: "assembler-casing" },
  grateCasing: { label: "Решётчатый корпус", texture: "grate-casing" },
  asslineCasing: { label: "Корпус сборочной линии", texture: "assline-casing" },
  asslineController: { label: "Контроллер", texture: "assline-controller", face: { rule: "front", base: "solid-steel" } },
  volcanusCasing: { label: "Корпус Вулкануса", texture: "volcanus-casing" },
  volcanusController: { label: "Контроллер", texture: "volcanus-controller", face: { rule: "front", base: "volcanus-casing" } },
  absCasing: { label: "Корпус плавильни сплавов", texture: "abs-casing" },
  absFirebox: { label: "Топка из стабаллоя", texture: "abs-firebox" },
  absController: { label: "Контроллер", texture: "abs-controller", face: { rule: "front", base: "abs-casing" } },
  wsteelCasing: { label: "Корпус из вольфрамовой стали", texture: "wsteel-casing" },
  wsteelFirebox: { label: "Топка из вольфрамовой стали", texture: "wsteel-firebox" },
  wsteelTurbine: { label: "Корпус турбины из вольфрамовой стали", texture: "wsteel-turbine" },
  steelGearbox: { label: "Стальной редуктор", texture: "steel-gearbox" },
  extremeIntake: { label: "Усиленный воздухозаборник", texture: "extreme-intake" },
  eceController: { label: "Контроллер", texture: "ece-controller", face: { rule: "front", base: "wsteel-casing" } },
  eceDynamo: { label: "Динамо-люк", texture: "ece-dynamo", face: { rule: "outward", base: "wsteel-casing" } },

  // Постройки LuV
  luvCasing: { label: "Машинный корпус LuV", texture: "hull-luv-side" },
  superCoil: { label: "Сверхпроводящая катушка", texture: "super-coil" },
  fusion1Controller: { label: "Контроллер", texture: "fusion1-controller", face: { rule: "front", base: "hull-luv-side" } },
  wsteelPipe: { label: "Трубный корпус из вольфрамовой стали", texture: "wsteel-pipe" },
  wsteelFrame: { label: "Рама из вольфрамовой стали", texture: "wsteel-frame", isCutout: true },
  plasmaDynamo: { label: "Динамо-люк", texture: "plasma-dynamo", face: { rule: "outward", base: "wsteel-turbine" } },
  plasmaTurbine1: { label: "Корпус турбины", texture: "plasma-turbine-1", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine2: { label: "Корпус турбины", texture: "plasma-turbine-2", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine3: { label: "Корпус турбины", texture: "plasma-turbine-3", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine4: { label: "Корпус турбины", texture: "plasma-turbine-4", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine5: { label: "Корпус турбины", texture: "plasma-turbine-5", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine6: { label: "Корпус турбины", texture: "plasma-turbine-6", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine7: { label: "Корпус турбины", texture: "plasma-turbine-7", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine8: { label: "Корпус турбины", texture: "plasma-turbine-8", face: { rule: "front", base: "wsteel-turbine" } },
  plasmaTurbine9: { label: "Корпус турбины", texture: "plasma-turbine-9", face: { rule: "front", base: "wsteel-turbine" } },
  processorCasing: { label: "Корпус процессора", texture: "processor-casing" },
  speedingPipe: { label: "Ускоряющая труба", texture: "speeding-pipe" },
  naController: { label: "Контроллер", texture: "na-controller", face: { rule: "front", base: "clean-stainless" } },

  // Постройки ZPM
  fusionCasing: { label: "Корпус реактора синтеза", texture: "fusion-casing" },
  fusion3Casing: { label: "Корпус реактора синтеза II", texture: "fusion3-casing" },
  fusion3Controller: { label: "Контроллер", texture: "fusion3-controller", face: { rule: "front", base: "fusion3-casing" } },
  fusionCoil: { label: "Катушка синтеза", texture: "fusion-coil" },
  fusionController: { label: "Контроллер", texture: "fusion-controller", face: { rule: "front", base: "fusion-casing" } },
  naqCasing: { label: "Корпус наквадового реактора", texture: "naq-casing", isCool: true },
  fieldCasing: { label: "Корпус удержания поля", texture: "field-casing", isCool: true },
  radFrame: { label: "Рама с защитой от излучения", texture: "rad-frame", isCutout: true, isCool: true },
  // Постройки UEV и UIV
  fusion4Casing: { label: "Корпус реактора синтеза IV", texture: "fusion4-casing" },
  fusion4Coil: { label: "Катушка синтеза II", texture: "fusion4-coil" },
  fusion4Controller: { label: "Контроллер", texture: "fusion4-controller", face: { rule: "front", base: "fusion4-casing" } },
  fusion5Casing: { label: "Корпус реактора синтеза V", texture: "fusion5-casing" },
  fusion5Coil: { label: "Катушка синтеза III", texture: "fusion5-coil" },
  fusion5Controller: { label: "Контроллер", texture: "fusion5-controller", face: { rule: "front", base: "fusion5-casing" } },
  dimTrans: { label: "Пространственно-трансцендентный корпус", texture: "dim-trans" },
  dimInjector: { label: "Корпус пространственной инжекции", texture: "dim-injector" },
  dimBridge: { label: "Пространственный мост", texture: "dim-bridge" },
  awakenedCoil: { label: "Катушка из пробуждённого дракония", texture: "coil-awakened", isHot: true },
  dtpfController: { label: "Контроллер", texture: "dtpf-controller", face: { rule: "front", base: "dim-injector" } },
  tpmController: { label: "Контроллер", texture: "tpm-controller", face: { rule: "front", base: "dim-injector" } },

  nanoFirewall: { label: "Корпус проекции файрвола", texture: "nano-firewall" },
  nanoMesh: { label: "Корпус сетевого интерфейса наночипов", texture: "nano-mesh" },
  nanoReinforcement: { label: "Укреплённый корпус наночипов", texture: "nano-reinforcement" },
  nanoMatrix: { label: "Корпус вычислительной матрицы", texture: "nano-matrix" },
  nanoGlass: { label: "Стекло комплекса наночипов", texture: "nano-glass", isGlass: true },
  nanoController: { label: "Контроллер", texture: "nano-controller", face: { rule: "front", base: "nano-mesh" } },
  extremeDensity: { label: "Корпус сверхплотного искривления", texture: "extreme-density" },
  radiationAbsorbent: { label: "Корпус поглощения фонового излучения", texture: "radiation-absorbent" },
  hawkingGlass: { label: "Фокус излучения Хокинга", texture: "hawking-glass", isGlass: true },
  bhcController: { label: "Контроллер", texture: "bhc-controller", face: { rule: "front", base: "radiation-absorbent" } },
  godforgeTrim: { label: "Обшивка механизма", texture: "godforge-trim" },
  godforgeInner: { label: "Внутренняя обшивка", texture: "godforge-inner" },
  godforgeSupport: { label: "Опора", texture: "godforge-support" },
  godforgeOuter: { label: "Внешняя обшивка", texture: "godforge-outer" },
  godforgeEnergy: { label: "Энергетическая обшивка", texture: "godforge-energy" },
  hypogenCoil: { label: "Катушка из гипогена", texture: "coil-hypogen", isHot: true },
  godforgeModuleController: { label: "Контроллер", texture: "godforge-module-controller", face: { rule: "front", base: "godforge-trim" } },

  becConduit: { label: "Плазменный кондуит сохранения когерентности", texture: "bec-conduit" },
  becCasing: { label: "Электромагнитно-изолированный корпус", texture: "bec-casing" },
  becManipulator: { label: "Манипулятор постоянной тонкой структуры", texture: "bec-manipulator" },
  becConflict: { label: "Корпус индуцирования конфликта", texture: "bec-conflict" },
  becPeace: { label: "Миротворческий корпус", texture: "bec-peace" },
  becPrimaryCoil: { label: "Конденсатная трансформаторная катушка", texture: "bec-primary-coil", isHot: true },
  becSecondaryCoil: { label: "Катушка для отвода конденсата", texture: "bec-secondary-coil", isHot: true },
  becWaveguide: { label: "Электромагнитный волновод", texture: "bec-glass", isGlass: true },
  becGeneratorController: { label: "Контроллер", texture: "bec-generator-controller", face: { rule: "front", base: "bec-casing" } },
  becStorageController: { label: "Контроллер", texture: "bec-storage-controller", face: { rule: "front", base: "bec-casing" } },
  becAssemblerController: { label: "Контроллер", texture: "bec-assembler-controller", face: { rule: "front", base: "bec-casing" } },
  becNodeController: { label: "Контроллер", texture: "bec-node-controller", face: { rule: "front", base: "bec-casing" } },
  becGateController: { label: "Контроллер", texture: "bec-gate-controller", face: { rule: "front", base: "bec-casing" } },
  gravitonT1: { label: "Удалённый модулятор потока гравитонов", texture: "graviton-1" },
  gravitonT2: { label: "Средний модулятор потока гравитонов", texture: "graviton-2" },
  gravitonT3: { label: "Центральный модулятор потока гравитонов", texture: "graviton-3" },
  godforgeLens: { label: "Пространственно-трансцендентная гравитационная линза", texture: "godforge-lens", isGlass: true },
  godforgeController: { label: "Контроллер", texture: "godforge-controller", face: { rule: "front", base: "godforge-trim" } },

  // Постройки UMV и UXV
  fridgeCasing: { label: "Корпус холодильника", texture: "fridge-casing", isCool: true },
  coolantDuct: { label: "Охлаждающий воздуховод", texture: "coolant-duct", isCool: true },
  infinityCooled: { label: "Корпус с бесконечным охлаждением", texture: "infinity-cooled", isCool: true },
  wsteelReinforced: { label: "Укреплённый блок из вольфрамовой стали", texture: "wsteel-reinforced" },
  callistoFrame: { label: "Рама из льда Каллисто", texture: "callisto-frame", isCutout: true, isCool: true },
  ledoxSheet: { label: "Листовой металл из ледокса", texture: "ledox-sheet", isCool: true },
  fridgeController: { label: "Контроллер", texture: "fridge-controller", face: { rule: "front", base: "fridge-casing" }, isCool: true },
  eohTemporal: { label: "Укреплённый временной структурный корпус", texture: "eoh-temporal" },
  eohSpatial: { label: "Укреплённый пространственный структурный корпус", texture: "eoh-spatial" },
  eohBoundary: { label: "Граничный корпус бесконечной энергии пространства-времени", texture: "eoh-boundary" },
  eohCompression: { label: "Генератор поля пространственно-временного сжатия", texture: "eoh-compression" },
  eohDilation: { label: "Генератор поля замедления времени", texture: "eoh-dilation" },
  eohStabilisation: { label: "Генератор поля стабилизации", texture: "eoh-stabilisation" },
  eohController: { label: "Контроллер", texture: "eoh-controller", face: { rule: "front", base: "eoh-boundary" } },

  // Мега-машины и квантовый силовой преобразователь
  naqDistill: { label: "Дистилляционный корпус, укреплённый наквадой", texture: "naq-distill" },
  naqSheet: { label: "Листовой металл из наквады", texture: "naq-sheet" },
  naquadahCoil: { label: "Катушка из наквады", texture: "coil-naquadah", isHot: true },
  strongBronze: { label: "Прочный бронзовый корпус", texture: "bronze-bricks", isMatte: true },
  mcrController: { label: "Контроллер", texture: "mcr-controller", face: { rule: "front", base: "inert-casing" } },
  mocController: { label: "Контроллер", texture: "moc-controller", face: { rule: "front", base: "naq-distill" } },
  mdtController: { label: "Контроллер", texture: "mdt-controller", face: { rule: "front", base: "naq-distill" } },
  hearthCasing: { label: "Корпус горна", texture: "hearth-casing" },
  hearthController: { label: "Контроллер", texture: "hearth-controller", face: { rule: "front", base: "hearth-casing" } },
  blackPlutoniumPipe: { label: "Предметный полый корпус из чёрного плутония", texture: "black-plutonium-pipe" },
  radiantNaq: { label: "Корпус из сияющего наквадового сплава", texture: "radiant-naq" },
  prismaticFrame: { label: "Рама из призматической наквады", texture: "prismatic-frame", isCutout: true },
  thermalContainment: { label: "Термоизолирующий корпус", texture: "thermal-containment" },
  hearthMuffler: { label: "Глушитель", texture: "hearth-muffler", face: { rule: "up", base: "thermal-containment" } },
  qftManipulator: { label: "Нейтронный импульсный манипулятор", texture: "qft-manipulator" },
  qftShielding: { label: "Нейтронное защитное ядро", texture: "qft-shielding" },
  qftCoil: { label: "Катушка квантового преобразователя", texture: "qft-coil" },
  qftCasing: { label: "Корпус квантового преобразователя", texture: "qft-casing" },
  qftGlass: { label: "Стекло силового поля", texture: "qft-glass", isGlass: true },
  qftController: { label: "Контроллер", texture: "qft-controller", face: { rule: "front", base: "qft-casing" } },

  // Звёздные врата (SGCraft, MIT): узор кольца и шеврона — на лицевой стороне, бока — гладкий блок врат.
  sgRing: { label: "Блок кольца Звёздных врат", texture: "sg-ring", face: { rule: "front", base: "sg-block" } },
  sgChevron: { label: "Блок шеврона Звёздных врат", texture: "sg-chevron", face: { rule: "front", base: "sg-block" } },
  sgBase: { label: "Основа Звёздных врат", texture: "sg-base", face: { rule: "front", base: "sg-block" } },
  sgDhd: { label: "Наборное устройство Звёздных врат", texture: "sg-dhd-top", face: { rule: "up", base: "sg-dhd-side" } },
  sgPower: { label: "RF блок питания Звёздных врат", texture: "sg-power-top", face: { rule: "up", base: "sg-power-side" } },

  // Постройки UV и UHV
  naqReinforced: { label: "Укреплённый наквадой блок", texture: "naq-reinforced" },
  neutroniumBlock: { label: "Блок нейтрониума", texture: "neutronium-block" },
  naqFrame: { label: "Рама из наквады", texture: "naq-frame", isCutout: true },
  megaAbsController: { label: "Контроллер", texture: "mega-abs-controller", face: { rule: "front", base: "abs-casing" } },
  neutroniumCasing: { label: "Нейтрониевый корпус", texture: "neutronium-casing" },
  neutroniumActive: { label: "Активный нейтрониевый корпус", texture: "neutronium-active" },
  neutroniumStable: { label: "Стабильный нейтрониевый корпус", texture: "neutronium-stable" },
  naqAlloyFrame: { label: "Рама из наквадового сплава", texture: "naq-alloy-frame", isCutout: true },
  ncController: { label: "Контроллер", texture: "nc-controller", face: { rule: "front", base: "neutronium-casing" } },
  eicController: { label: "Контроллер", texture: "eic-controller", face: { rule: "front", base: "naq-reinforced" } },
  lnrController: { label: "Контроллер", texture: "lnr-controller", face: { rule: "front", base: "naq-casing" }, isCool: true },

  // Постройки, выведенные генератором (lib/gen-kinds.ts).
  // Блоки линий производства (lib/setups.ts): сундук, воронка и вагонетка — свои рисунки вместо блоков Minecraft.
  // Сундук: защёлка только на передней грани, остальные — доски с рамкой.
  ownChest: { label: "Сундук", texture: "own-chest", face: { rule: "front", base: "own-chest-side" }, shape: "chest", isMatte: true },
  ownHopper: { label: "Воронка", texture: "own-hopper", shape: "hopper" },
  // Воронки с носиком вбок: подают в блок за собой, перед собой или справа.
  ownHopperBack: { label: "Воронка", texture: "own-hopper", shape: "hopper", spout: "nz" },
  ownHopperFront: { label: "Воронка", texture: "own-hopper", shape: "hopper", spout: "pz" },
  ownHopperRight: { label: "Воронка", texture: "own-hopper", shape: "hopper", spout: "px" },
  // Блок постройки с вагонеткой внутри: клетка остаётся блоком, нижняя половина закрашена цветом вагонетки.
  cokeBrickCart: { label: "Кирпич коксовой печи, внутри вагонетка с воронкой", texture: "cart-coke-brick", isMatte: true },
  firebrickCart: { label: "Огнеупорный кирпич, внутри вагонетка с воронкой", texture: "cart-firebrick", isMatte: true },
  itemPipe: { label: "Латунная предметная труба", texture: "pipe-brass", shape: "pipe" },
  steamPipe: { label: "Бронзовая жидкостная труба с паром", texture: "pipe-bronze", shape: "pipe" },
  steamHatch: { label: "Паровой люк", texture: "input-hatch", face: { rule: "outward", base: "bronze-bricks" } },
  waterPipe: { label: "Медная жидкостная труба с водой", texture: "pipe-copper", shape: "pipe" },
  // Люки коксовой печи (MTEHatchCokeOven) — на месте любого её кирпича: вход угля, выход кокса, выход креозота.
  cokeHatchIn: { label: "Люк коксовой печи: вход", texture: "coke-hatch-in", face: { rule: "outward", base: "coke-brick" }, isMatte: true },
  cokeHatchItems: { label: "Люк коксовой печи: выход предметов", texture: "coke-hatch-items", face: { rule: "outward", base: "coke-brick" }, isMatte: true },
  cokeHatchFluid: { label: "Люк коксовой печи: выход жидкости", texture: "coke-hatch-fluid", face: { rule: "outward", base: "coke-brick" }, isMatte: true },
  creosotePipe: { label: "Медная жидкостная труба с креозотом", texture: "pipe-copper", shape: "pipe" },
  // Трубы топливных цепочек LV: биомасса → сброженная → биогаз или этанол; масло семян и биодизель.
  biomassPipe: { label: "Медная жидкостная труба с биомассой", texture: "pipe-copper", shape: "pipe" },
  fermentedPipe: { label: "Медная жидкостная труба со сброженной биомассой", texture: "pipe-copper", shape: "pipe" },
  biogasPipe: { label: "Стальная жидкостная труба с биогазом", texture: "pipe-steel", shape: "pipe" },
  ethanolPipe: { label: "Медная жидкостная труба с этанолом", texture: "pipe-copper", shape: "pipe" },
  seedOilPipe: { label: "Медная жидкостная труба с маслом семян", texture: "pipe-copper", shape: "pipe" },
  biodieselPipe: { label: "Стальная жидкостная труба с биодизелем", texture: "pipe-steel", shape: "pipe" },
  // Жидкостная труба фабрики калькулятора: жидкости там разные, подпись — общая.
  calcFluidPipe: { label: "Жидкостная труба", texture: "pipe-steel", shape: "pipe" },
  oxygenPipe: { label: "Стальная жидкостная труба с кислородом", texture: "pipe-steel", shape: "pipe" },
  lavaPipe: { label: "Стальная жидкостная труба с лавой", texture: "pipe-steel", shape: "pipe" },
  pumpSteamHatch: { label: "Паровой люк помпы", texture: "input-hatch", face: { rule: "outward", base: "wood" } },
  pumpOutputHatch: { label: "Выходной люк помпы с водой", texture: "pump-output-hatch", face: { rule: "outward", base: "wood" } },
  // Кабели линий производства — по ярусам, из того же материала, что и в рецепте корпуса машины.
  cableLv: { label: "Оловянный кабель", texture: "i-cable-tin", shape: "pipe" },
  cableMv: { label: "Медный кабель", texture: "i-cable-copper", shape: "pipe" },
  cableHv: { label: "Золотой кабель", texture: "i-cable-gold", shape: "pipe" },
  cableEv: { label: "Алюминиевый кабель", texture: "i-cable-aluminium", shape: "pipe" },
  cableIv: { label: "Вольфрамовый кабель", texture: "i-cable-tungsten", shape: "pipe" },
  cableLuv: { label: "Кабель из ванадий-галлия", texture: "i-cable-vanadiumgallium", shape: "pipe" },
  cableZpm: { label: "Кабель из наквады", texture: "i-cable-naquadah", shape: "pipe" },
  cableUv: { label: "Кабель из сплава наквады", texture: "i-cable-naquadahalloy", shape: "pipe" },
  ...GEN_KINDS,
} satisfies Record<string, BlockKind>;

export type KindId = keyof typeof KINDS;


export interface Fact {
  readonly label: string;
  readonly value: string;
}

export interface Machine {
  readonly slug: string;
  /** Название в игре. */
  readonly name: string;
  /** Короткое русское название. */
  readonly title: string;
  /** Ярус напряжения: на какой странице стоит машина. */
  readonly tier: TierId;
  /** Одна строка для каталога. */
  readonly summary: string;
  /** Абзацы для страницы машины, простым языком. */
  readonly story: readonly string[];
  readonly facts: readonly Fact[];
  /** Откуда взята схема: ссылка на файл в исходниках мода или на страницу вики. */
  readonly source: string;
  readonly def: StructureDef & { readonly kinds: Readonly<Record<string, KindId>> };
}

// Бонусы больших паровых построек над одноблочными — вики GTNH, страницы Steam Hearth, Steam Grinder и другие.
const STEAM_FACTS: readonly Fact[] = [
  { label: "Работает на", value: "паре" },
  { label: "За один раз", value: "8 рецептов" },
  { label: "Быстрее одноблочной", value: "на 25 %" },
  { label: "Пара от одноблочной", value: "62,5 %" },
  { label: "Ярусы", value: "бронза и сталь" },
];

const STEAM_NOTE =
  "У постройки два яруса. Бронзовый показан здесь. Стальной (высокого давления) собирается точно так же, только из стальных блоков — он работает быстрее и ест больше пара. Паровой люк и шины для предметов ставятся на место любого обычного кирпича.";

const MULTI = `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${ASSETS.gregtechCommit}/src/main/java/gregtech/common/tileentities/machines/multi`;

export const MACHINES: readonly Machine[] = [
  {
    slug: "bricked-blast-furnace",
    name: "Bricked Blast Furnace",
    title: "Кирпичная домна",
    tier: "steam",
    summary: "Первая сталь в игре. Ни пара, ни электричества — только кирпич, уголь и терпение.",
    story: [
      "С этой печи начинается сталь. Она сложена из огнеупорных кирпичей, а внутри, пока идёт плавка, стоит столб лавы высотой в два блока.",
      "В крыше оставлена дыра ровно по центру — через неё выходит дым. Закрыть её нельзя: печь перестанет считаться собранной.",
      "Домне не нужны ни пар, ни электричество — в неё кладут железо и уголь и ждут. Долго. Поэтому таких печей обычно строят сразу несколько.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Огнеупорных кирпичей", value: "32" },
      { label: "Работает на", value: "угле, без пара" },
      { label: "Внутри", value: "2 блока лавы" },
    ],
    source: `${MULTI}/MTEBrickedBlastFurnace.java`,
    def: {
      layers: [
        ["ccc", "c-c", "ccc"],
        ["ccc", "clc", "ccc"],
        ["c~c", "clc", "ccc"],
        ["ccc", "ccc", "ccc"],
      ],
      kinds: { c: "firebrick", "~": "bbfController" },
      hollow: "l-",
    },
  },
  {
    slug: "coke-oven",
    name: "Coke Oven",
    title: "Коксовая печь",
    tier: "steam",
    summary: "Пережигает уголь в кокс, а дерево — в древесный уголь. Заодно даёт креозот.",
    story: [
      "Самая простая постройка в игре: куб три на три на три из кирпичей коксовой печи с одним пустым блоком внутри.",
      "Печь медленно пережигает уголь в кокс — топливо, которое горит дольше и нужно для домны. Побочный продукт — креозот, им пропитывают дерево.",
      "Ей не нужна никакая энергия. Чтобы подавать и забирать предметы автоматически, на место любого кирпича ставят специальный люк.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Кирпичей", value: "до 25" },
      { label: "Работает на", value: "собственном жаре" },
      { label: "Внутри", value: "1 блок воздуха" },
    ],
    source: `${MULTI}/MTECokeOven.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["C~C", "C-C", "CCC"],
        ["CCC", "CCC", "CCC"],
      ],
      kinds: { C: "cokeBrick", "~": "cokeController" },
      hollow: "-",
    },
  },
  {
    slug: "water-tank",
    name: "Water Tank",
    title: "Водяной бак",
    tier: "steam",
    summary: "Собирает воду прямо из воздуха. Медленно, зато бесплатно — до парового насоса другого способа нет.",
    story: [
      "Паровым котлам нужна вода, и первая вода в игре берётся из воздуха. Водяной бак — это полый куб три на три на три из двадцати шести стенок, а внутри копится вода.",
      "У бака нет ни контроллера, ни люков: его просто ставят и ждут. Чем влажнее место, тем быстрее он наполняется; дождь ускоряет втрое, а крыша над баком — замедляет вдвое.",
      "Бак — из соседнего мода Railcraft, который входит в сборку GT New Horizons. Позже бак сменяет паровой насос: он даёт воды в десятки раз больше.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Стенок", value: "26" },
      { label: "Работает на", value: "влажности воздуха" },
      { label: "Даёт воды", value: "до 30 л/с" },
    ],
    source: "https://wiki.gtnewhorizons.com/wiki/Water_Tank",
    def: {
      layers: [
        ["TTT", "TTT", "TTT"],
        ["TTT", "T-T", "TTT"],
        ["TTT", "TTT", "TTT"],
      ],
      kinds: { T: "waterTankSiding" },
      hollow: "-",
      interior: "water",
    },
  },
  {
    slug: "steam-furnace",
    name: "Steam Hearth",
    title: "Паровая печь",
    tier: "steam",
    summary: "Большая печь на пару: плавит по восемь предметов сразу.",
    story: [
      "Многоблочная версия обычной печи. Внизу — трубные корпуса, по которым идёт пар, в середине — три топки, сверху — кольцо из четырёх редукторов.",
      "Одна такая постройка заменяет восемь одноблочных паровых печей: она плавит до восьми предметов за раз.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 3" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamFurnaceMulti.java`,
    def: {
      layers: [
        [" B ", "B B", " B "],
        ["A~A", "D D", "ADA"],
        ["ACA", "CAC", "ACA"],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzePipe", D: "bronzeFirebox", "~": "furnaceController" },
    },
  },
  {
    slug: "steam-alloy-smelter",
    name: "Steam Fuser",
    title: "Паровая плавильня сплавов",
    tier: "steam",
    summary: "Сплавляет два металла в один — например, медь и олово в бронзу.",
    story: [
      "Плавильня соединяет два металла в сплав. Именно в ней делают бронзу, из которой собрана вся паровая эра.",
      "Постройка вытянута в глубину. По бокам в неё вставлены четыре стекла, а внутри идут два трубных корпуса — через стекло их видно.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 4" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamAlloySmelter.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC", "CCC"],
        ["C~C", "GPG", "GPG", "CCC"],
        ["CCC", "CCC", "CCC", "CCC"],
      ],
      kinds: { C: "bronzeBricks", G: "glass", P: "bronzePipe", "~": "smelterController" },
    },
  },
  {
    slug: "steam-macerator",
    name: "Steam Grinder",
    title: "Паровая дробилка",
    tier: "steam",
    summary: "Дробит руду в пыль: из одного куска руды выходит больше металла.",
    story: [
      "Дробилка перемалывает руду в пыль. Из пыли при плавке получается больше металла, чем из руды напрямую, — поэтому дробилку строят одной из первых.",
      "По углам постройки стоят восемь рам — решётчатых блоков, сквозь которые видно нутро. На самом верху, в центре, — редуктор.",
      // В исходнике эта схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 4 × 3" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamMacerator.java`,
    def: {
      layers: [
        [" A ", "ABA", " A "],
        ["CAC", "A A", "CAC"],
        ["C~C", "A A", "CAC"],
        ["AAA", "AAA", "AAA"],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzeFrame", "~": "maceratorController" },
    },
  },
  {
    slug: "steam-compressor",
    name: "Steam Squasher",
    title: "Паровой компрессор",
    tier: "steam",
    summary: "Сжимает: девять слитков в блок, пыль в пластины.",
    story: [
      "Компрессор сжимает предметы — например, превращает девять слитков в один блок.",
      "Это самая длинная паровая постройка: семь блоков в глубину. Спереди контроллер окружён трубными корпусами, а в середине стоит пресс из шести блоков железа.",
      // В исходнике эта схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "3 × 3 × 7" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamCompressor.java`,
    def: {
      layers: [
        ["CCC", "AAA", "   ", "   ", "EEE", "   ", "AAA"],
        ["C~C", "AAA", " C ", " C ", "EEE", "   ", "AAA"],
        ["CCC", "AAA", "AAA", "AAA", "AAA", "AAA", "AAA"],
      ],
      kinds: { A: "bronzeBricks", C: "bronzePipe", E: "ironBlock", "~": "compressorController" },
    },
  },
  {
    slug: "steam-forge-hammer",
    name: "Steam Presser",
    title: "Паровой молот",
    tier: "steam",
    summary: "Расплющивает слитки в пластины. Самая высокая постройка паровой эры.",
    story: [
      "Молот бьёт по слиткам и превращает их в пластины — а из пластин делается почти всё остальное.",
      "Постройка похожа на настоящий паровой молот: широкое основание пять на пять, две стойки по бокам и боёк из двух блоков железа, который висит между ними.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "5 × 7 × 5" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamForgeHammer.java`,
    def: {
      layers: [
        ["     ", "     ", "  B  ", "     ", "     "],
        ["     ", "  A  ", "AABAA", "  A  ", "     "],
        ["     ", "     ", "A C A", "     ", "     "],
        ["     ", "     ", "A C A", "     ", "     "],
        ["     ", "     ", "A   A", "     ", "     "],
        ["     ", " A~A ", "AA AA", " AAA ", "     "],
        [" AAA ", "AAAAA", "AAAAA", "AAAAA", " AAA "],
      ],
      kinds: { A: "bronzeBricks", B: "bronzePipe", C: "ironBlock", "~": "hammerController" },
    },
  },
  {
    slug: "steam-water-pump",
    name: "Water Pump",
    title: "Паровой насос",
    tier: "steam",
    summary: "Качает воду для котлов. Чем влажнее место, тем больше воды.",
    story: [
      "Паровым котлам постоянно нужна вода, и носить её вёдрами быстро надоедает. Насос качает воду сам.",
      "Основание — деревянные корпуса, над ними — вышка из десяти бронзовых рам. Сколько воды насос даёт, зависит от влажности места, где он стоит: в болоте больше, в пустыне почти ничего.",
      "Насос сменяет водяной бак: тот собирает воду из воздуха бесплатно, но в десятки раз медленнее. У насоса два яруса — с бронзовыми рамами и со стальными. Паровой люк ставится на место любого деревянного корпуса.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 4" },
      { label: "Бронзовых рам", value: "10" },
      { label: "Деревянных корпусов", value: "9" },
      { label: "Работает на", value: "паре" },
    ],
    source: `${MULTI}/steam/MTESteamWaterPump.java`,
    def: {
      layers: [
        [" A ", " A ", "AAA", " A "],
        [" A ", "   ", "A A", " A "],
        ["C~C", "CCC", "CCC", "CCC"],
      ],
      kinds: { A: "bronzeFrame", C: "wood", "~": "pumpController" },
    },
  },
  {
    slug: "steam-blender",
    name: "Steam Blender",
    title: "Паровой смеситель",
    tier: "steam",
    summary: "Смешивает пыли в сплавы. Одноблочного парового смесителя нет — только эта постройка.",
    story: [
      "Смеситель мешает пыли: из нескольких металлов получается пыль сплава. До него пыль мешают руками на верстаке.",
      "Постройка — чаша пять на пять: в середине редуктор с четырьмя рамами вокруг, над ним труба и второй редуктор — мешалка на оси.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "5 × 4 × 5" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamMixer.java`,
    def: {
      layers: [
        ["     ", "  A  ", " ABA ", "  A  ", "     "],
        ["  A  ", "     ", "A C A", "     ", "  A  "],
        [" A~A ", "A D A", "ADBDA", "A D A", " AAA "],
        [" AAA ", "AAAAA", "AAAAA", "AAAAA", " AAA "],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzePipe", D: "bronzeFrame", "~": "separatorController" },
    },
  },
  {
    slug: "steam-separator",
    name: "Steam Separator",
    title: "Паровой сепаратор",
    tier: "steam",
    summary: "Центрифуга на пару: разделяет пыли и смолу на составные части.",
    story: [
      "Сепаратор раскручивает предметы и делит их на части: пыль — на составные металлы, липкую смолу — на резину и клей.",
      "Это бочка пять на пять на пять. По оси идут три топки, вокруг них — кольца из редукторов и трубных корпусов.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "5 × 5 × 5" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamCentrifuge.java`,
    def: {
      layers: [
        [" AAA ", "AAAAA", "AAAAA", "AAAAA", " AAA "],
        ["     ", " ABA ", " BDB ", " ABA ", "     "],
        ["  A  ", " ACA ", "ACDCA", " ACA ", "  A  "],
        [" A~A ", "AABAA", "ABDBA", "AABAA", " AAA "],
        [" AAA ", "AAAAA", "AAAAA", "AAAAA", " AAA "],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzePipe", D: "bronzeFirebox", "~": "separatorController" },
    },
  },
  {
    slug: "steam-purifier",
    name: "Steam Purifier",
    title: "Паровой очиститель",
    tier: "steam",
    summary: "Промывает дроблёную руду. Самая большая и дорогая постройка паровой эры.",
    story: [
      "Очиститель моет дроблёную руду в воде. До него руду моют руками в котле.",
      "Слева — пульт с контроллером, справа — стеклянный бак с водой, в котором крутится ось из трубных корпусов. Над баком идёт труба к пульту. Воду в бак наливать не нужно: он наполняется сам, когда постройка начинает работать.",
      STEAM_NOTE,
    ],
    facts: [{ label: "Размер", value: "9 × 6 × 5" }, { label: "Стёкол", value: "24" }, ...STEAM_FACTS],
    source: `${MULTI}/steam/MTESteamWasher.java`,
    def: {
      layers: [
        ["         ", "         ", " CCCCCC  ", "         ", "         "],
        ["         ", "         ", " C    C  ", "         ", "         "],
        ["     AAA ", "    A   A", " C  A C A", "    A   A", "     AAA "],
        ["    AGGGA", "AAA G   G", "AAA G C G", "AAA G   G", "    AGGGA"],
        ["    AGGGA", "A~A GEEEG", "AAA GECEG", "AAA GEEEG", "    AGGGA"],
        ["    AAAAA", "AAA ABBBA", "AAA ABABA", "AAA ABBBA", "    AAAAA"],
      ],
      kinds: { A: "bronzeBricks", B: "bronzeGearbox", C: "bronzePipe", G: "glass", "~": "purifierController" },
      hollow: "E",
      interior: "water",
    },
  },
  {
    slug: "railcraft-boiler",
    name: "Railcraft Boiler",
    title: "Котёл Railcraft",
    tier: "steam",
    summary: "Большой котёл из топок и баков: пара хватает на весь паровой цех и на первые турбины.",
    story: [
      "Одноблочные котлы дают мало пара. Котёл Railcraft собирают из блоков: снизу слой топок, над ним — баки. Чем больше топок и баков, тем больше пара и топлива.",
      "Здесь показан котёл три на три с тремя слоями баков — 9 топок и 27 баков. Бывают и меньше: самый маленький — одна топка и один бак.",
      "У котла нет ни контроллера, ни люков: щёлкните по любому блоку — откроется его окно. Блоки — из соседнего мода Railcraft, который входит в сборку GT New Horizons.",
    ],
    facts: [
      { label: "Размер", value: "от 1 × 2 × 1 до 3 × 5 × 3" },
      { label: "Здесь показан", value: "3 × 4 × 3" },
      { label: "Топок", value: "9" },
      { label: "Баков", value: "27" },
      { label: "Работает на", value: "твёрдом или жидком топливе" },
    ],
    source: "https://wiki.gtnewhorizons.com/wiki/Railcraft_Boiler",
    def: {
      layers: [
        ["TTT", "TTT", "TTT"],
        ["TTT", "TTT", "TTT"],
        ["TTT", "TTT", "TTT"],
        ["FFF", "FFF", "FFF"],
      ],
      kinds: { T: "rcTank", F: "rcFirebox" },
    },
  },
  {
    slug: "electric-blast-furnace",
    name: "Electric Blast Furnace",
    title: "Электрическая доменная печь",
    tier: "lv",
    summary: "Что идёт после пара: первая большая печь на электричестве.",
    story: [
      "Этой печью паровая эра заканчивается. Она плавит то, что кирпичной домне не по силам: алюминий, а позже — нержавеющую сталь и титан.",
      "Низ и верх — жаропрочный корпус, в который врезаны люки. Середина — два кольца нагревательных катушек, всего шестнадцать. Внутри обязательно пусто: если туда попадёт хоть один блок, печь не соберётся.",
      "Контроллер стоит строго спереди внизу по центру, глушитель — в центре крыши. Остальные люки можно ставить в нижнем слое в любом порядке; здесь показан один из вариантов.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Катушек", value: "16" },
      { label: "Работает на", value: "электричестве, от LV" },
      { label: "Загрязнение", value: "400 в секунду" },
    ],
    source: `${MULTI}/MTEElectricBlastFurnace.java`,
    def: {
      // В исходнике нижний слой — «b~b / bbb / bbb»: на место «b» мод разрешает любой люк. Здесь люки расставлены.
      layers: [
        ["fff", "fmf", "fff"],
        ["CCC", "C-C", "CCC"],
        ["CCC", "C-C", "CCC"],
        ["I~O", "EbM", "EFb"],
      ],
      kinds: {
        f: "heatproof",
        b: "heatproof",
        m: "muffler",
        C: "coil",
        "~": "ebfController",
        I: "inputBus",
        O: "outputBus",
        E: "energy",
        M: "maintenance",
        F: "inputHatch",
      },
      hollow: "-",
    },
  },
  {
    slug: "electric-air-filter",
    name: "Electric Air Filter",
    title: "Электрический воздушный фильтр",
    tier: "lv",
    summary: "Чистит воздух от загрязнения в соседних чанках.",
    story: [
      "Домны, котлы и генераторы загрязняют воздух. Грязный воздух вредит игроку, губит растения и портит землю. Фильтр это загрязнение убирает.",
      "Низ и верх — корпуса турбины фильтра, по углам средних слоёв — вентиляционные корпуса, между ними — глушители. Внутри должно быть пусто.",
      "В контроллер вставляют турбину. Чем лучше турбина и чем больше глушителей (до восьми), тем быстрее чистится воздух. Люки ставят в нижний слой; здесь показан один из вариантов.",
    ],
    facts: [
      { label: "Размер", value: "3 × 4 × 3" },
      { label: "Вентиляционных корпусов", value: "8" },
      { label: "Глушителей", value: "от 1 до 8" },
      { label: "Работает на", value: "электричестве, от LV" },
    ],
    source: `${MULTI}/MTEAirFilterBase.java`,
    def: {
      // В исходнике нижний слой — «c~c / ccc / ccc», а «m» — глушитель или корпус. Здесь люки расставлены.
      layers: [
        ["xxx", "xxx", "xxx"],
        ["vmv", "m-m", "vmv"],
        ["vmv", "m-m", "vmv"],
        ["E~M", "xIx", "xxx"],
      ],
      kinds: {
        x: "airCasing",
        v: "airVent",
        m: "airMuffler",
        "~": "airController",
        E: "airEnergy",
        M: "airMaintenance",
        I: "airInputBus",
      },
      hollow: "-",
    },
  },
  {
    slug: "multi-smelter",
    name: "Multi Smelter",
    title: "Мультиплавильня",
    tier: "mv",
    summary: "Печь, которая плавит десятки предметов разом.",
    story: [
      "Мультиплавильня — обычная печь, только большая: плавит всё то же, что каменная, но помногу сразу. С самыми простыми катушками — по 8 предметов, и с каждым ярусом катушек вдвое больше.",
      "Собрана как маленькая доменная печь: низ и верх из жаропрочного корпуса, между ними одно кольцо из восьми катушек. Внутри должно быть пусто.",
      "Она умеет то, чего не умеет почти ни одна постройка: вести разные рецепты в одном заходе — например, плавить железную и медную пыль одновременно.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Катушек", value: "8" },
      { label: "За один раз", value: "от 8 предметов" },
      { label: "Работает на", value: "электричестве" },
      { label: "Загрязнение", value: "400 в секунду" },
    ],
    source: `${MULTI}/MTEMultiFurnace.java`,
    def: {
      // В исходнике нижний слой — «b~b / bbb / bbb»: на место «b» мод разрешает любой люк. Здесь люки расставлены.
      layers: [
        ["fff", "fmf", "fff"],
        ["CCC", "C-C", "CCC"],
        ["I~O", "EbM", "bbb"],
      ],
      kinds: {
        f: "heatproof",
        b: "heatproof",
        m: "muffler",
        C: "coil",
        "~": "multiSmelterController",
        I: "inputBus",
        O: "outputBus",
        E: "energy",
        M: "maintenance",
      },
      hollow: "-",
    },
  },
  {
    slug: "pyrolyse-oven",
    name: "Pyrolyse Oven",
    title: "Пиролизная печь",
    tier: "mv",
    summary: "Пережигает брёвна в уголь и даёт жидкость для химии: древесный газ, дёготь, уксус.",
    story: [
      "Пиролизная печь сменяет кирпичную коксовую. Она тоже пережигает брёвна в древесный уголь, но на электричестве и с разгоном — и вместе с углём даёт одну жидкость на выбор.",
      "Эти жидкости и есть главное: из древесного газа получают этилен, а из него — полиэтилен, без которого не перейти в HV.",
      "Постройка длинная и низкая: две камеры с катушками, между ними проход. Спереди — четыре топки, сзади — две трубы с рамами наверху.",
      // В исходнике схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      "Люки ставят на место корпуса: энергию, обслуживание и выход — в нижний слой, глушитель и вход — в верхний. Здесь показан один из вариантов.",
    ],
    facts: [
      { label: "Размер", value: "7 × 6 × 5" },
      { label: "Катушек", value: "12" },
      { label: "Трубных корпусов", value: "8" },
      { label: "Работает на", value: "электричестве, от MV" },
      { label: "Загрязнение", value: "300 в секунду" },
    ],
    source: `${MULTI}/MTEPyrolyseOven.java`,
    def: {
      layers: [
        ["       ", "       ", "       ", "       ", " E   E "],
        ["       ", "       ", "       ", "       ", " A   A "],
        [" m   D ", " C   C ", " C   C ", " C   C ", " A   A "],
        ["DBD DBD", "D DDD D", "D DDD D", "D DDD D", "DAD DAD"],
        ["DBD~DBD", "D D D D", "D     D", "D D D D", "DADDDAD"],
        ["DNDODMD", "DCDDDCD", "DCDDDCD", "DCDDDCD", "DDDDDDD"],
      ],
      kinds: {
        A: "steelPipe",
        B: "steelFirebox",
        C: "coil",
        D: "pyroCasing",
        E: "steelFrame",
        m: "pyroMuffler",
        N: "pyroEnergy",
        O: "pyroOutputBus",
        M: "pyroMaintenance",
        "~": "pyroController",
      },
    },
  },
  {
    slug: "fluid-drilling-rig",
    name: "Fluid Drilling Rig",
    title: "Буровая вышка",
    tier: "mv",
    summary: "Качает нефть и другие жидкости из-под коренной породы.",
    story: [
      "Под коренной породой лежат огромные залежи жидкостей — нефти, газа и других. Буровая опускает трубу до самого низа мира и качает их наверх.",
      "Основание — три на три из цельной стали с люками, над ним три блока корпуса в стальных рамах, а выше — мачта из рам.",
      "Буровые трубы кладут в контроллер. Труба появляется под центром постройки и ломает всё на пути вниз.",
    ],
    facts: [
      { label: "Размер", value: "3 × 7 × 3" },
      { label: "Стальных рам", value: "15" },
      { label: "Работает на", value: "электричестве, от MV" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTEDrillerBase.java`,
    def: {
      // В исходнике нижний слой — «b~b / bbb / bbb»: на место «b» мод разрешает люки. Здесь люки расставлены.
      layers: [
        ["   ", " f ", "   "],
        ["   ", " f ", "   "],
        ["   ", " f ", "   "],
        [" f ", "fcf", " f "],
        [" f ", "fcf", " f "],
        [" f ", "fcf", " f "],
        ["E~M", "cHc", "ccc"],
      ],
      kinds: {
        f: "steelFrame",
        c: "solidSteel",
        "~": "drillController",
        E: "drillEnergy",
        M: "drillMaintenance",
        H: "drillOutputHatch",
      },
    },
  },
  {
    slug: "large-bronze-boiler",
    name: "Large Bronze Boiler",
    title: "Большой бронзовый котёл",
    tier: "mv",
    summary: "Многоблочный котёл GregTech: жжёт твёрдое и жидкое топливо, даёт пар для больших турбин.",
    story: [
      "Большой котёл сменяет котёл Railcraft. У него четыре яруса — бронзовый, стальной, титановый и вольфрамостальной; здесь показан первый, бронзовый.",
      "Внизу — слой топок, над ним — корпус с трубами внутри, а справа поднимается дымовая труба.",
      // В исходнике схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      "Электричества котёл не тратит. Люки для топлива, воды и пара ставят на место любого корпуса или топки.",
    ],
    facts: [
      { label: "Размер", value: "5 × 6 × 3" },
      { label: "Топок", value: "до 15" },
      { label: "Трубных корпусов", value: "4" },
      { label: "Работает на", value: "твёрдом и жидком топливе" },
      { label: "Загрязнение", value: "200 в секунду" },
    ],
    source: `${MULTI}/MTELargeBoilerBase.java`,
    def: {
      layers: [
        ["   C ", "  CCC", "   C "],
        ["   C ", "  C C", "   C "],
        ["   C ", "PPC C", "   C "],
        [" CCC ", "PCC P", " CCC "],
        ["CC~CC", "C   C", "CCCCC"],
        ["FFFFF", "FFFFF", "FFFFF"],
      ],
      kinds: { C: "bronzeBricks", P: "bronzePipe", F: "bronzeFirebox", "~": "largeBoilerController" },
    },
  },
  {
    slug: "chemical-plant",
    name: "ExxonMobil Chemical Plant",
    title: "Химический завод",
    tier: "mv",
    summary: "Большая химия из дополнения GT++: ракетное топливо, нитробензол, водоросли.",
    story: [
      "Химический завод — постройка из дополнения GT++, которое входит в сборку. Он ведёт сложные реакции, которые обычному реактору не даются.",
      "Это куб семь на семь на семь. Снаружи — каркас из прочных корпусов, внутри — этажерка: слои машинных корпусов, катушек и трубных корпусов.",
      "У завода четыре вида блоков, и каждый можно улучшать отдельно. Здесь показан первый ярус: бронзовые корпуса, машинные корпуса LV, бронзовые трубы и катушки из мельхиора.",
    ],
    facts: [
      { label: "Размер", value: "7 × 7 × 7" },
      { label: "Улучшаемых частей", value: "4" },
      { label: "Работает на", value: "электричестве, от MV" },
      { label: "Из дополнения", value: "GT++" },
    ],
    source: `https://github.com/GTNewHorizons/GT5-Unofficial/blob/${ASSETS.gregtechCommit}/src/main/java/gtPlusPlus/xmod/gregtech/common/tileentities/machines/multi/production/chemplant/MTEChemicalPlant.java`,
    def: {
      layers: [
        ["CCCCCCC", "CCCCCCC", "CCCCCCC", "CCCCCCC", "CCCCCCC", "CCCCCCC", "CCCCCCC"],
        ["C     C", " MMMMM ", " MHHHM ", " MHHHM ", " MHHHM ", " MMMMM ", "C     C"],
        ["C     C", "       ", "  PPP  ", "  PPP  ", "  PPP  ", "       ", "C     C"],
        ["C     C", "       ", "  HHH  ", "  HHH  ", "  HHH  ", "       ", "C     C"],
        ["C     C", "       ", "  PPP  ", "  PPP  ", "  PPP  ", "       ", "C     C"],
        ["C     C", " MMMMM ", " MHHHM ", " MHHHM ", " MHHHM ", " MMMMM ", "C     C"],
        ["CCC~CCC", "CMMMMMC", "CMMMMMC", "CMMMMMC", "CMMMMMC", "CMMMMMC", "CCCCCCC"],
      ],
      kinds: { C: "bronzeBricks", M: "lvCasing", H: "coil", P: "bronzePipe", "~": "chemPlantController" },
    },
  },
  {
    slug: "algae-farm",
    name: "Algae Farm",
    title: "Ферма водорослей",
    tier: "mv",
    summary: "Выращивает водоросли на одном электричестве. Тоже из GT++.",
    story: [
      "Ферма водорослей растит водоросли — сырьё для химии GT++. Кроме электричества, ей ничего не нужно, и воздух она не грязнит.",
      "Это стеклянная труба с водой длиной в десять блоков: по торцам — корпуса на ножках и фильтры, внутри вдоль всей трубы идёт ось из рам.",
      // В исходнике схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      "Воду заливают один раз, при запуске. Какие водоросли вырастут и как быстро — зависит от яруса энергетического люка.",
    ],
    facts: [
      { label: "Размер", value: "3 × 6 × 10" },
      { label: "Стёкол", value: "64" },
      { label: "Фильтров", value: "5" },
      { label: "Работает на", value: "электричестве, от MV" },
      { label: "Из дополнения", value: "GT++" },
    ],
    source: `${MULTI}/MTEAlgaePond.java`,
    def: {
      layers: [
        ["BBB", " A ", " A ", " A ", " A ", " A ", " A ", " A ", " A ", "BBB"],
        ["BCB", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "BCB"],
        ["BCB", "AEA", "ADA", "ADA", "ADA", "ADA", "ADA", "ADA", "AEA", "BCB"],
        ["B~B", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "AEA", "BCB"],
        ["BBB", " A ", " A ", " A ", " A ", " A ", " A ", " A ", " A ", "BBB"],
        ["B B", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "B B"],
      ],
      kinds: { A: "glass", B: "algaeCasing", C: "filterCasing", D: "stainlessFrame", "~": "algaeController" },
      hollow: "E",
      interior: "water",
    },
  },
  {
    slug: "cleanroom",
    name: "Cleanroom",
    title: "Чистая комната",
    tier: "hv",
    summary: "Стерильная комната: без неё не собрать сложные схемы.",
    story: [
      "С HV сложные схемы и их детали можно делать только в стерильной чистоте. Чистая комната — это коробка из пласкрита, внутрь которой ставят машины.",
      "Пол и стены — пласкрит, в потолке — фильтры, а в самой его середине — контроллер. Внутри пусто: там стоят машины. Размер любой, от трёх до пятнадцати блоков; здесь показана комната пять на пять на пять — её хватает.",
      "Дверь и люки здесь не показаны: дверь ставят в стену, а предметы, жидкости и ток заводят внутрь через машинные корпуса на месте блоков пласкрита.",
    ],
    facts: [
      { label: "Размер", value: "от 3 × 4 × 3 до 15 × 15 × 15" },
      { label: "Здесь показана", value: "5 × 5 × 5" },
      { label: "Работает на", value: "электричестве, от HV" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTECleanroom.java`,
    def: {
      // У комнаты нет записанной схемы: мод проверяет коробку по правилам. Это один из допустимых размеров.
      layers: [
        ["PPPPP", "PFFFP", "PFKFP", "PFFFP", "PPPPP"],
        ["PPPPP", "P   P", "P   P", "P   P", "PPPPP"],
        ["PPPPP", "P   P", "P   P", "P   P", "PPPPP"],
        ["PPPPP", "P   P", "P   P", "P   P", "PPPPP"],
        ["PPPPP", "PPPPP", "PPPPP", "PPPPP", "PPPPP"],
      ],
      // Контроллер стоит в потолке и смотрит вверх, поэтому он не «~»: этим знаком помечен контроллер на фасаде.
      kinds: { P: "plascrete", F: "filterCasing", K: "cleanroomController" },
    },
  },
  {
    slug: "distillation-tower",
    name: "Distillation Tower",
    title: "Ректификационная колонна",
    tier: "hv",
    summary: "Делит жидкость сразу на все составные части. Самая дорогая и самая выгодная постройка яруса.",
    story: [
      "Одноблочный дистиллятор достаёт из жидкости одну часть за раз, остальное пропадает. Колонна достаёт все части сразу — выход, скорость и расход энергии становятся намного лучше.",
      "Внизу — основание с контроллером и входом. Выше — слои, по одному на каждый продукт: у каждого слоя свой выходной люк. Высота — от трёх до двенадцати слоёв; здесь показана колонна из шести.",
      "Внутри колонна пустая, сверху закрыта крышкой.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3, высота от 3 до 12" },
      { label: "Здесь показана", value: "3 × 6 × 3" },
      { label: "Работает на", value: "электричестве, от HV" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTEDistillationTower.java`,
    def: {
      // В исходнике колонна собирается из кусков: основание «b~b / bbb / bbb» и слои «lll / l-l / lll».
      layers: [
        ["sss", "sss", "sss"],
        ["sss", "s-H", "sss"],
        ["sss", "s-H", "sss"],
        ["sss", "s-H", "sss"],
        ["sss", "s-H", "sss"],
        ["s~s", "sss", "sss"],
      ],
      kinds: { s: "stainlessCasing", H: "dtOutputHatch", "~": "dtController" },
      hollow: "-",
    },
  },
  {
    slug: "large-chemical-reactor",
    name: "Large Chemical Reactor",
    title: "Большой химический реактор",
    tier: "hv",
    summary: "Химический реактор без капсул и с идеальным разгоном.",
    story: [
      "Большой реактор ведёт те же реакции, что одноблочный, и ещё несколько своих — например, серную кислоту прямо из серы, воды и кислорода.",
      "Это куб три на три на три из химически стойких корпусов. В самой середине — трубный корпус из тефлона, а вплотную к нему, с любой стороны, — одна нагревательная катушка.",
      "Люки здесь не показаны: они ставятся на место любого корпуса.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Катушек", value: "1, любого яруса" },
      { label: "Разгон", value: "идеальный" },
      { label: "Работает на", value: "электричестве, от HV" },
    ],
    source: `${MULTI}/MTELargeChemicalReactor.java`,
    def: {
      layers: [
        ["ccc", "ccc", "ccc"],
        ["c~c", "cPc", "cHc"],
        ["ccc", "ccc", "ccc"],
      ],
      kinds: { c: "inertCasing", P: "ptfePipe", H: "coil", "~": "lcrController" },
    },
  },
  {
    slug: "vacuum-freezer",
    name: "Vacuum Freezer",
    title: "Вакуумный морозильник",
    tier: "hv",
    summary: "Остужает раскалённые слитки из доменной печи.",
    story: [
      "Некоторые металлы выходят из доменной печи раскалёнными, и пользоваться ими нельзя. Морозильник остужает такие слитки — быстрее и дешевле, чем химическая ванна.",
      "Самая простая постройка яруса: куб три на три на три из морозостойких корпусов с пустой серединой. Люки ставятся на место любого корпуса; здесь они не показаны.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Корпусов", value: "от 16 до 21" },
      { label: "Работает на", value: "электричестве, от HV" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTEVacuumFreezer.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["C~C", "C-C", "CCC"],
        ["CCC", "CCC", "CCC"],
      ],
      kinds: { C: "frostProof", "~": "freezerController" },
      hollow: "-",
      interior: "water",
    },
  },
  {
    slug: "oil-cracking-unit",
    name: "Oil Cracking Unit",
    title: "Крекинг-установка",
    tier: "hv",
    summary: "Расщепляет нефтепродукты на лёгкие фракции паром или водородом.",
    story: [
      "Крекинг — расщепление тяжёлых нефтепродуктов на лёгкие. Раньше его вели в химическом реакторе; установка делает то же дешевле по энергии и с прибавкой на выходе.",
      "Постройка лежит на боку: пять блоков в ширину. По краям — стенки из нержавейки, между ними два кольца катушек, а посередине — ещё одно кольцо корпусов с контроллером.",
      "Люки здесь не показаны, но их места строгие: сырьё входит с одного торца, пар или водород — посередине, а готовое выходит с другого торца.",
    ],
    facts: [
      { label: "Размер", value: "5 × 3 × 3" },
      { label: "Катушек", value: "16" },
      { label: "Работает на", value: "электричестве, от HV" },
      { label: "Загрязнение", value: "нет" },
    ],
    source: `${MULTI}/MTEOilCracker.java`,
    def: {
      layers: [
        ["sCsCs", "sCsCs", "sCsCs"],
        ["sC~Cs", "s---s", "sCsCs"],
        ["sCsCs", "sCsCs", "sCsCs"],
      ],
      kinds: { s: "stainlessCasing", C: "coil", "~": "crackerController" },
      hollow: "-",
    },
  },
  {
    slug: "implosion-compressor",
    name: "Implosion Compressor",
    title: "Имплозионный компрессор",
    tier: "hv",
    summary: "Сжимает взрывом: плотные пластины для ракет и самоцветы из пыли.",
    story: [
      "Внутрь кладут предмет и взрывчатку. Взрыв сжимает пыль в самоцвет, а слитки — в плотные пластины, из которых строят ракеты.",
      "Куб три на три на три из цельной стали с пустой серединой. Собрать его можно ещё в MV, но по-настоящему нужен он в HV. Люки ставятся на место любого корпуса; здесь они не показаны.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 3" },
      { label: "Корпусов", value: "от 16 до 20" },
      { label: "Работает на", value: "электричестве и взрывчатке" },
      { label: "Загрязнение", value: "10 000 в секунду" },
    ],
    source: `${MULTI}/MTEImplosionCompressor.java`,
    def: {
      layers: [
        ["CCC", "CCC", "CCC"],
        ["C~C", "C-C", "CCC"],
        ["CCC", "CCC", "CCC"],
      ],
      kinds: { C: "solidSteel", "~": "implosionController" },
      hollow: "-",
    },
  },
  {
    slug: "large-steam-turbine",
    name: "Large Steam Turbine",
    title: "Большая паровая турбина",
    tier: "hv",
    summary: "Многоблочная турбина: превращает пар в электричество намного выгоднее одноблочных.",
    story: [
      "Одноблочные турбины с каждым ярусом теряют КПД. Большая турбина — постройка: в её контроллер вставляют ротор, и от ротора зависит, сколько пара она берёт и сколько тока даёт.",
      "Спереди — стенка три на три с ротором. За ней — вал из трубных корпусов в железных рамах, потом корпус из двух слоёв, а в самом хвосте — динамо-люк, через который выходит ток.",
      // В исходнике схема записана срезами от фасада назад; здесь она переложена в слои сверху вниз.
      "Перед ротором должно быть пусто: три на три блока воздуха.",
    ],
    facts: [
      { label: "Размер", value: "3 × 3 × 6" },
      { label: "Железных рам", value: "14" },
      { label: "Работает на", value: "паре" },
      { label: "Выдаёт", value: "ток через динамо-люк" },
    ],
    source: `${MULTI}/turbines/MTELargeTurbineBase.java`,
    def: {
      layers: [
        ["123", " B ", " B ", "ApA", "ApA", "B B"],
        ["456", "BAB", "BAB", "pAp", "pAp", "BDB"],
        ["789", " B ", " B ", "ApA", "ApA", "B B"],
      ],
      kinds: {
        1: "turbine1",
        2: "turbine2",
        3: "turbine3",
        4: "turbine4",
        5: "turbine5",
        6: "turbine6",
        7: "turbine7",
        8: "turbine8",
        9: "turbine9",
        A: "steelPipe",
        B: "ironFrame",
        p: "turbineCasing",
        D: "turbineDynamo",
      },
    },
  },
  ...HIGH_MACHINES,
  ...GEN_MACHINES,
];

/** Все виды блоков постройки: общий справочник и её собственные (генераторы и котлы линий производства). */
export function kindsOf(machine: Machine): Readonly<Record<string, BlockKind>> {
  return machine.def.extraKinds ? { ...KINDS, ...machine.def.extraKinds } : KINDS;
}

export function findMachine(slug: string): Machine | undefined {
  return MACHINES.find((machine) => machine.slug === slug);
}

const structureCache = new Map<string, Structure>();

/** Постройка машины, развёрнутая в блоки. Считается один раз на машину. */
export function structureOf(machine: Machine): Structure {
  const cached = structureCache.get(machine.slug);
  if (cached) return cached;
  const structure = buildStructure(machine.def, kindsOf(machine));
  structureCache.set(machine.slug, structure);
  return structure;
}

/** Корпус одноблочной машины: гладкий металл или металл с кирпичом (у печей). */
export type Hull = "plain" | "bricked";

/** Две версии одноблочной паровой машины. */
export type SteamTier = "bronze" | "steel";
export const STEAM_TIERS: readonly SteamTier[] = ["bronze", "steel"];
export const STEAM_TIER_TITLES: Record<SteamTier, string> = { bronze: "Бронзовая", steel: "Стальная" };

/** Одноблочная паровая машина: что делает, какой у неё фасад и что про неё рассказать. */
export interface SingleBlock {
  readonly id: string;
  readonly hull: Hull;
  /** Название в игре без приставок версии: «Steam …» и «High Pressure Steam …» добавляются сами. */
  readonly name: string;
  readonly title: string;
  readonly does: string;
  /** Что машина делает и зачем она нужна — абзац для её страницы. */
  readonly about: string;
  /** Многоблочная версия, если она есть. */
  readonly multiSlug?: string;
}

export const SINGLE_BLOCKS: readonly SingleBlock[] = [
  {
    id: "macerator",
    hull: "plain",
    name: "Macerator",
    title: "Дробилка",
    does: "руду в пыль",
    about:
      "Дробит руду в пыль. Из пыли при плавке выходит больше металла, чем из руды напрямую, а иногда и побочный продукт — поэтому дробилку ставят одной из первых.",
    multiSlug: "steam-macerator",
  },
  {
    id: "furnace",
    hull: "bricked",
    name: "Furnace",
    title: "Печь",
    does: "пыль в слитки",
    about: "Плавит пыль в слитки и готовит всё, что готовит обычная печь, — только греется паром, а не углём.",
    multiSlug: "steam-furnace",
  },
  {
    id: "alloy-smelter",
    hull: "bricked",
    name: "Alloy Smelter",
    title: "Плавильня сплавов",
    does: "два металла в сплав",
    about:
      "Сплавляет два металла в один. Её главный рецепт — бронза из меди и олова, а из бронзы собрана вся паровая эра.",
    multiSlug: "steam-alloy-smelter",
  },
  {
    id: "hammer",
    hull: "plain",
    name: "Forge Hammer",
    title: "Молот",
    does: "слитки в пластины",
    about: "Бьёт по слиткам и расплющивает их в пластины. Из пластин делаются корпуса почти всех машин.",
    multiSlug: "steam-forge-hammer",
  },
  {
    id: "compressor",
    hull: "plain",
    name: "Compressor",
    title: "Компрессор",
    does: "сжимает в блоки",
    about: "Сжимает предметы: девять слитков — в блок, пыль — в пластину, растения — в плотные брикеты.",
    multiSlug: "steam-compressor",
  },
  {
    id: "extractor",
    hull: "plain",
    name: "Extractor",
    title: "Экстрактор",
    does: "вытягивает резину и краски",
    about: "Вытягивает из предметов полезное: резину из смолы, краски из цветов.",
  },
];

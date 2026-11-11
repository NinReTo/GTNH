import { Effect } from "postprocessing";
import { Color, Uniform } from "three";
import { POST, THEME } from "@/lib/config";

/**
 * Единственный самописный шейдер проекта — переход сцены в страницу.
 * Заливает кадр цветом фона страницы снизу вверх, с мягкой кромкой:
 * лендинг приезжает снизу, и к его приходу кадр уже того же цвета — шва нет.
 *
 * Чисел здесь нет: ширина кромки и цвет приходят из lib/config.ts,
 * 0.0 и 1.0 — только границы отрезка.
 */
const fragmentShader = /* glsl */ `
uniform float uProgress;
uniform float uSoftness;
uniform vec3 uColor;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float edge = uProgress * (1.0 + uSoftness);
  float fill = 1.0 - smoothstep(edge - uSoftness, edge, uv.y);
  outputColor = vec4(mix(inputColor.rgb, uColor, fill), inputColor.a);
}
`;

export class TransitionEffect extends Effect {
  constructor() {
    super("TransitionEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ["uProgress", new Uniform(0)],
        ["uSoftness", new Uniform(POST.transition.softness)],
        // Color переводит #rrggbb в линейное пространство; на выходе композер
        // кодирует обратно в sRGB — на экране получается ровно цвет страницы.
        ["uColor", new Uniform(new Color(THEME.bg))],
      ]),
    });
  }

  setProgress(progress: number): void {
    const uniform = this.uniforms.get("uProgress");
    if (uniform) uniform.value = progress;
  }
}

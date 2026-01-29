/**
 * HTMLサニタイズ用composable
 * XSS攻撃を防ぐためにDOMPurifyを使用
 */
import DOMPurify from "dompurify";

export function useSanitize() {
  /**
   * SVG文字列をサニタイズ
   * SVGタグのみを許可し、スクリプトやイベントハンドラを除去
   */
  const sanitizeSvg = (html: string): string => {
    if (typeof window === "undefined") {
      // SSR時はそのまま返す（クライアントで再サニタイズされる）
      return html;
    }

    return DOMPurify.sanitize(html, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ALLOWED_TAGS: [
        "svg",
        "path",
        "circle",
        "rect",
        "line",
        "polyline",
        "polygon",
        "ellipse",
        "g",
        "defs",
        "clipPath",
        "use",
      ],
      ALLOWED_ATTR: [
        "class",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "viewBox",
        "d",
        "cx",
        "cy",
        "r",
        "x",
        "y",
        "width",
        "height",
        "points",
        "transform",
        "id",
        "clip-path",
        "xlink:href",
      ],
    });
  };

  /**
   * 一般的なHTMLをサニタイズ
   */
  const sanitizeHtml = (html: string): string => {
    if (typeof window === "undefined") {
      return html;
    }

    return DOMPurify.sanitize(html);
  };

  return {
    sanitizeSvg,
    sanitizeHtml,
  };
}

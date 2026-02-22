import sanitizeHtml from "sanitize-html";

/**
 * TipTap'tan gelen HTML içeriğini sanitize eder.
 * script, on* event handler ve tehlikeli attribute'ları temizler.
 */
export function sanitizeContent(html: string): string {
	return sanitizeHtml(html, {
		allowedTags: [
			// Yapısal
			"p", "br", "hr", "div", "span",
			// Başlıklar
			"h1", "h2", "h3", "h4", "h5", "h6",
			// Metin biçimlendirme
			"strong", "b", "em", "i", "u", "s", "strike", "code", "pre", "mark",
			// Listeler
			"ul", "ol", "li",
			// Alıntı & tablo
			"blockquote", "table", "thead", "tbody", "tr", "th", "td",
			// Medya
			"img", "figure", "figcaption",
			// Bağlantı
			"a",
		],
		allowedAttributes: {
			"*": ["class", "style"],
			"a": ["href", "target", "rel"],
			"img": ["src", "alt", "width", "height"],
			"td": ["colspan", "rowspan"],
			"th": ["colspan", "rowspan"],
		},
		allowedSchemes: ["https", "http", "mailto"],
		allowedSchemesByTag: {
			img: ["https", "http", "data"],
		},
		// on* event handler'larını kaldır
		disallowedTagsMode: "discard",
	});
}

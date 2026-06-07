// Kàá — Yoruba Number Engine (Swift port)
// ---------------------------------------------------------------------------
// Identical semantics to src/lib/yorubaNumbers.ts (web app, repo root).
// Hand-verified 0–99 in
// traditional mode; hundreds combining forms are programmatic and should be
// reviewed by a fluent speaker before shipping.

import Foundation

public enum YorubaMode: String, CaseIterable, Identifiable, Codable {
    case traditional
    case modern
    public var id: String { rawValue }
}

public enum YorubaNumberEngine {
    // MARK: Tier 1 – units 0–10
    public static let base0to10: [Int: String] = [
        0: "Òdo",
        1: "Ọ̀kan",
        2: "Méjì",
        3: "Mẹ́ta",
        4: "Mẹ́rin",
        5: "Márùn-ún",
        6: "Mẹ́fà",
        7: "Méje",
        8: "Mẹ́jọ",
        9: "Mẹ́sàn-án",
        10: "Mẹ́wàá",
    ]

    // MARK: Tier 2 – round tens
    public static let tensBase: [Int: String] = [
        20: "Ogún",
        30: "Ọgbọ̀n",
        40: "Ogójì",
        50: "Àádọ́ta",
        60: "Ọgọ́ta",
        70: "Àádọ́rin",
        80: "Ọgọ́rin",
        90: "Àádọ́rùn",
        100: "Ọgọ́rùn-ún",
    ]

    // MARK: Tier 3 – hundreds
    public static let hundredsBase: [Int: String] = [
        100: "Ọgọ́rùn-ún",
        200: "Igba",
        300: "Ọ̀ọ́dúnrún",
        400: "Irinwó",
        500: "Ẹ̀ẹ́dẹ́gbẹ̀ta",
        600: "Ẹgbẹ̀ta",
        700: "Ẹ̀ẹ́dẹ́gbẹ̀rin",
        800: "Ẹgbẹ̀rin",
        900: "Ẹ̀ẹ́dẹ́gbẹ̀rún",
        1000: "Ẹgbẹ̀rún",
    ]

    // MARK: Tier 4 – hand-verified 0–99 traditional
    public static let traditional0to99: [Int: String] = [
        0: "Òdo", 1: "Ọ̀kan", 2: "Méjì", 3: "Mẹ́ta", 4: "Mẹ́rin",
        5: "Márùn-ún", 6: "Mẹ́fà", 7: "Méje", 8: "Mẹ́jọ", 9: "Mẹ́sàn-án",
        10: "Mẹ́wàá",
        11: "Mọ́kànlá", 12: "Méjìlá", 13: "Mẹ́tàlá", 14: "Mẹ́rìnlá",
        15: "Mẹ́ẹ̀dógún", 16: "Mẹ́rìndínlógún", 17: "Mẹ́tàdínlógún",
        18: "Méjìdínlógún", 19: "Mọ́kàndínlógún",
        20: "Ogún",
        21: "Mọ́kànlélógún", 22: "Méjìlélógún", 23: "Mẹ́tàlélógún",
        24: "Mẹ́rìnlélógún",
        25: "Mẹ́ẹ̀dọ́gbọ̀n", 26: "Mẹ́rìndínlọ́gbọ̀n",
        27: "Mẹ́tàdínlọ́gbọ̀n", 28: "Méjìdínlọ́gbọ̀n",
        29: "Mọ́kàndínlọ́gbọ̀n",
        30: "Ọgbọ̀n",
        31: "Mọ́kànlélọ́gbọ̀n", 32: "Méjìlélọ́gbọ̀n",
        33: "Mẹ́tàlélọ́gbọ̀n", 34: "Mẹ́rìnlélọ́gbọ̀n",
        35: "Márùndínlógójì", 36: "Mẹ́rìndínlógójì",
        37: "Mẹ́tàdínlógójì", 38: "Méjìdínlógójì",
        39: "Mọ́kàndínlógójì",
        40: "Ogójì",
        41: "Mọ́kànlélógójì", 42: "Méjìlélógójì",
        43: "Mẹ́tàlélógójì", 44: "Mẹ́rìnlélógójì",
        45: "Márùndínláàádọ́ta", 46: "Mẹ́rìndínláàádọ́ta",
        47: "Mẹ́tàdínláàádọ́ta", 48: "Méjìdínláàádọ́ta",
        49: "Mọ́kàndínláàádọ́ta",
        50: "Àádọ́ta",
        51: "Mọ́kànléláàádọ́ta", 52: "Méjìléláàádọ́ta",
        53: "Mẹ́tàléláàádọ́ta", 54: "Mẹ́rìnléláàádọ́ta",
        55: "Márùndínlọ́gọ́ta", 56: "Mẹ́rìndínlọ́gọ́ta",
        57: "Mẹ́tàdínlọ́gọ́ta", 58: "Méjìdínlọ́gọ́ta",
        59: "Mọ́kàndínlọ́gọ́ta",
        60: "Ọgọ́ta",
        61: "Mọ́kànlélọ́gọ́ta", 62: "Méjìlélọ́gọ́ta",
        63: "Mẹ́tàlélọ́gọ́ta", 64: "Mẹ́rìnlélọ́gọ́ta",
        65: "Márùndínláàádọ́rin", 66: "Mẹ́rìndínláàádọ́rin",
        67: "Mẹ́tàdínláàádọ́rin", 68: "Méjìdínláàádọ́rin",
        69: "Mọ́kàndínláàádọ́rin",
        70: "Àádọ́rin",
        71: "Mọ́kànléláàádọ́rin", 72: "Méjìléláàádọ́rin",
        73: "Mẹ́tàléláàádọ́rin", 74: "Mẹ́rìnléláàádọ́rin",
        75: "Márùndínlọ́gọ́rin", 76: "Mẹ́rìndínlọ́gọ́rin",
        77: "Mẹ́tàdínlọ́gọ́rin", 78: "Méjìdínlọ́gọ́rin",
        79: "Mọ́kàndínlọ́gọ́rin",
        80: "Ọgọ́rin",
        81: "Mọ́kànlélọ́gọ́rin", 82: "Méjìlélọ́gọ́rin",
        83: "Mẹ́tàlélọ́gọ́rin", 84: "Mẹ́rìnlélọ́gọ́rin",
        85: "Márùndínláàádọ́rùn", 86: "Mẹ́rìndínláàádọ́rùn",
        87: "Mẹ́tàdínláàádọ́rùn", 88: "Méjìdínláàádọ́rùn",
        89: "Mọ́kàndínláàádọ́rùn",
        90: "Àádọ́rùn",
        91: "Mọ́kànléláàádọ́rùn", 92: "Méjìléláàádọ́rùn",
        93: "Mẹ́tàléláàádọ́rùn", 94: "Mẹ́rìnléláàádọ́rùn",
        95: "Márùndínlọ́gọ́rùn", 96: "Mẹ́rìndínlọ́gọ́rùn",
        97: "Mẹ́tàdínlọ́gọ́rùn", 98: "Méjìdínlọ́gọ́rùn",
        99: "Mọ́kàndínlọ́gọ́rùn",
    ]

    // MARK: Scale words for grouping 1,000 and above
    // Ẹgbẹ̀rún (1,000) is the classical vigesimal word (igba × 5); million /
    // billion / trillion use the widely-used modern loan terms. Grouping by these
    // and joining with "àti" lets the engine name any value.
    // Modern Yorùbá borrows the international scale names. Int (64-bit) reaches a
    // quintillion (~9.2e18); higher scales (sextillion+) need a big-integer type,
    // which the TypeScript engine provides on the web.
    private static let scaleWords: [(value: Int, word: String)] = [
        (1_000_000_000_000_000_000, "Kwíntílíọ̀nù"), // quintillion
        (1_000_000_000_000_000, "Kwadírílíọ̀nù"), // quadrillion
        (1_000_000_000_000, "Tirílíọ̀nù"), // trillion
        (1_000_000_000, "Bílíọ̀nù"), // billion
        (1_000_000, "Mílíọ̀nù"), // million
        (1_000, "Ẹgbẹ̀rún"), // thousand
    ]

    // MARK: Public API

    /// Convert an integer to Yoruba words. Any non-negative Int is named in full
    /// Yorùbá (no upper table limit); negatives are prefixed with "Òdì".
    public static func toYoruba(_ n: Int, mode: YorubaMode = .traditional) -> String {
        if n < 0 {
            return "Òdì \(toYoruba(-n, mode: mode))"
        }
        return toWords(n, mode: mode)
    }

    /// Yoruba word for a calculator operator symbol.
    public static func operatorWord(_ symbol: String) -> String {
        switch symbol {
        case "+": return "pẹ̀lú"
        case "-", "−": return "yọ"
        case "*", "×": return "ìgbà"
        case "/", "÷": return "pín sí"
        case "^": return "ní ọ̀nà"
        case "=": return "dọ́gba"
        default: return symbol
        }
    }

    /// Yoruba phrase for an expression like "2+2".
    public static func expressionToYoruba(_ expr: String, mode: YorubaMode = .traditional) -> String {
        guard !expr.isEmpty else { return "" }
        let tokens = tokenizeExpression(expr)
        return tokens.map { token in
            if let n = Int(token) { return toYoruba(n, mode: mode) }
            if let d = Double(token) { return toYoruba(Int(d.rounded(.towardZero)), mode: mode) }
            return operatorWord(token)
        }.joined(separator: " ")
    }

    /// Yoruba word for a single tapped digit (including decimal point).
    public static func digitWord(_ digit: String, mode: YorubaMode = .traditional) -> String {
        if digit == "." { return "ààmì" }
        if let n = Int(digit) { return toYoruba(n, mode: mode) }
        return ""
    }

    // MARK: Internals

    /// Generative core: render a non-negative integer in Yorùbá.
    private static func toWords(_ n: Int, mode: YorubaMode) -> String {
        if n == 0 { return base0to10[0]! }
        if n < 100 {
            return mode == .traditional ? (traditional0to99[n] ?? String(n)) : modernUnder100(n)
        }
        if n < 1000 { return hundredsGroup(n, mode: mode) }

        // 1,000 and above: peel off the largest scale, recurse on the remainder.
        let scale = scaleWords.first(where: { n >= $0.value })!
        let count = n / scale.value
        let remainder = n % scale.value
        let head = "\(scale.word) \(asMultiplier(count, mode: mode))"
        if remainder == 0 { return head }
        // Traditional keeps the vigesimal additive particle "ó lé"; modern joins
        // place-value groups with the decimal "àti".
        let join = mode == .traditional ? "ó lé" : "àti"
        return "\(head) \(join) \(toWords(remainder, mode: mode))"
    }

    /// 100–999 as "hundred-base + remainder": base-first "ó lé" (traditional) or
    /// "Ọgọ́rùn-ún [×n] àti [remainder]" (modern).
    private static func hundredsGroup(_ n: Int, mode: YorubaMode) -> String {
        let hundredCount = n / 100
        let remainder = n % 100
        if mode == .traditional {
            let base = hundredsBase[hundredCount * 100] ?? String(hundredCount * 100)
            if remainder == 0 { return base }
            return "\(base) ó lé \(traditional0to99[remainder] ?? String(remainder))"
        }
        let hundredWord = hundredCount == 1
            ? (tensBase[100] ?? "Ọgọ́rùn-ún")
            : "\(tensBase[100] ?? "Ọgọ́rùn-ún") \(asMultiplier(hundredCount, mode: .modern))"
        if remainder == 0 { return hundredWord }
        return "\(hundredWord) àti \(modernUnder100(remainder))"
    }

    /// Modern decimal-additive form for 0–99: "[tens] àti [units]".
    private static func modernUnder100(_ n: Int) -> String {
        if n <= 10 { return base0to10[n] ?? String(n) }
        if n <= 14 { return traditional0to99[n] ?? String(n) }
        if let t = tensBase[n] { return t }
        let tens = (n / 10) * 10
        let units = n % 10
        let tensWord = tens == 10 ? (base0to10[10] ?? String(tens)) : (tensBase[tens] ?? String(tens))
        if units == 0 { return tensWord }
        return "\(tensWord) àti \(base0to10[units] ?? String(units))"
    }

    /// Multiplier after a scale or hundred word: "kan" for 1, else the
    /// number word with a lower-cased leading character so it reads as a modifier.
    private static func asMultiplier(_ n: Int, mode: YorubaMode) -> String {
        if n == 1 { return "kan" }
        let word = toWords(n, mode: mode)
        return word.prefix(1).lowercased() + word.dropFirst()
    }

    private static func tokenizeExpression(_ expr: String) -> [String] {
        let stripped = expr.replacingOccurrences(of: " ", with: "")
        var out: [String] = []
        var buf = ""
        for char in stripped {
            let s = String(char)
            if "+-−*×/÷^".contains(char) {
                if !buf.isEmpty { out.append(buf); buf = "" }
                out.append(s)
            } else {
                buf += s
            }
        }
        if !buf.isEmpty { out.append(buf) }
        return out
    }
}

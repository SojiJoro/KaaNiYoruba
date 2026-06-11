// Kàá — Yoruba Number Engine (Swift port)
// ---------------------------------------------------------------------------
// Identical semantics to src/lib/yorubaNumbers.ts (web app, repo root).
// All word tables come from YorubaNumberTables.generated.swift, generated from
// shared/yoruba-language-pack.json — the single source of truth for both
// engines. Run `npm run generate` at the repo root after editing the pack.

import Foundation

public enum YorubaMode: String, CaseIterable, Identifiable, Codable {
    case traditional
    case modern
    public var id: String { rawValue }
}

public enum YorubaNumberEngine {
    // Tables re-exported for views that referenced them directly.
    public static let base0to10 = YorubaTables.base0to10
    public static let tensBase = YorubaTables.tensBase
    public static let hundredsBase = YorubaTables.hundredsBase
    public static let traditional0to99 = YorubaTables.traditional0to99

    // Deficits this small read as "short of the next hundred" (ó dín) rather
    // than "over the current one" (ó lé): 595 = Ẹgbẹ̀ta ó dín Márùn-ún.
    // REVIEW: the exact cut-over point is dialect-variable; 1–10 is conservative.
    private static let oDinMaxDeficit = 10

    // MARK: Public API

    /// Convert an integer to Yoruba words. Any non-negative Int is named in full
    /// Yorùbá (no upper table limit); negatives are prefixed with "Òdì".
    public static func toYoruba(_ n: Int, mode: YorubaMode = .traditional) -> String {
        if n < 0 {
            return "\(YorubaTables.particles["negative"]!) \(toYoruba(-n, mode: mode))"
        }
        if mode == .traditional, let classical = classicalName(n) {
            return classical
        }
        return toWords(n, mode: mode)
    }

    /// Ordinal name: verified table for 1st–10th; larger ordinals use the
    /// positional fallback "Ipò [cardinal]".
    /// REVIEW: 5th–9th follow the regular ìk- pattern and the fallback phrasing
    /// should be confirmed by a fluent speaker.
    public static func toYorubaOrdinal(_ n: Int, mode: YorubaMode = .traditional) -> String {
        guard n >= 1 else { return "" }
        if let word = YorubaTables.ordinals1to10[n] { return word }
        let prefix = YorubaTables.particles["ordinalFallbackPrefix"]!
        return "\(prefix) \(lowerFirst(toYoruba(n, mode: mode)))"
    }

    /// Money phrasing: "náírà [cardinal]", with kobo appended when fractional —
    /// ₦500 → "náírà ẹ̀ẹ́dẹ́gbẹ̀ta", ₦12.50 → "náírà méjìlá àti kọ́bọ̀ àádọ́ta".
    public static func nairaToYoruba(_ amount: Double, mode: YorubaMode = .traditional) -> String {
        guard amount.isFinite else { return "—" }
        let sign = amount < 0 ? "\(YorubaTables.particles["negative"]!) " : ""
        let abs = Swift.abs(amount)
        let naira = Int(abs)
        let kobo = Int(((abs - Double(naira)) * 100).rounded())
        let nairaWord = YorubaTables.particles["naira"]!
        let phrase = "\(nairaWord) \(lowerFirst(toYoruba(naira, mode: mode)))"
        if kobo == 0 { return sign + phrase }
        let join = YorubaTables.particles["modernJoin"]!
        let koboWord = YorubaTables.particles["kobo"]!
        return "\(sign)\(phrase) \(join) \(koboWord) \(lowerFirst(toYoruba(kobo, mode: mode)))"
    }

    /// Yoruba word for a calculator operator symbol.
    public static func operatorWord(_ symbol: String) -> String {
        switch symbol {
        case "+": return YorubaTables.operatorWords["+"]!
        case "-", "−": return YorubaTables.operatorWords["-"]!
        case "*", "×": return YorubaTables.operatorWords["×"]!
        case "/", "÷": return YorubaTables.operatorWords["÷"]!
        case "^": return YorubaTables.operatorWords["^"]!
        case "=": return YorubaTables.operatorWords["="]!
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
        if digit == "." { return YorubaTables.particles["decimalMark"]! }
        if let n = Int(digit) { return toYoruba(n, mode: mode) }
        return ""
    }

    // MARK: Internals

    /// Classical vigesimal name for an exact traditional value, or nil.
    /// Applies only to the value as a whole (2,000 = Ẹgbàá; 20,000 = Ọkẹ́ kan),
    /// never inside compounds. REVIEW: ọkẹ́ multiples capped at 19 bags so
    /// values like 1,000,000 keep the modern Mílíọ̀nù reading.
    private static func classicalName(_ n: Int) -> String? {
        if let exact = YorubaTables.classicalExact[n] { return exact }
        if n >= YorubaTables.okeValue, n % YorubaTables.okeValue == 0 {
            let count = n / YorubaTables.okeValue
            if count < 20 {
                return "\(YorubaTables.okeWord) \(asMultiplier(count, mode: .traditional))"
            }
        }
        return nil
    }

    /// Generative core: render a non-negative integer in Yorùbá.
    private static func toWords(_ n: Int, mode: YorubaMode) -> String {
        if n == 0 { return YorubaTables.base0to10[0]! }
        if n < 100 {
            return mode == .traditional ? (YorubaTables.traditional0to99[n] ?? String(n)) : modernUnder100(n)
        }
        if n < 1000 { return hundredsGroup(n, mode: mode) }

        // 1,000 and above: peel off the largest scale, recurse on the remainder.
        let scale = YorubaTables.scaleWords.first(where: { n >= $0.value })!
        let count = n / scale.value
        let remainder = n % scale.value
        let head = "\(scale.word) \(asMultiplier(count, mode: mode))"
        if remainder == 0 { return head }
        // Traditional keeps the vigesimal additive particle "ó lé"; modern joins
        // place-value groups with the decimal "àti".
        let join = mode == .traditional
            ? YorubaTables.particles["addJoin"]!
            : YorubaTables.particles["modernJoin"]!
        return "\(head) \(join) \(toWords(remainder, mode: mode))"
    }

    /// 100–999 as "hundred-base ± remainder": base-first "ó lé" — or "ó dín"
    /// from the next hundred when the value falls just short of it
    /// (traditional); "Ọgọ́rùn-ún [×n] àti [remainder]" (modern).
    private static func hundredsGroup(_ n: Int, mode: YorubaMode) -> String {
        let hundredCount = n / 100
        let remainder = n % 100
        if mode == .traditional {
            let deficit = (hundredCount + 1) * 100 - n
            if remainder != 0, deficit <= oDinMaxDeficit {
                let nextBase = YorubaTables.hundredsBase[(hundredCount + 1) * 100] ?? String((hundredCount + 1) * 100)
                let subtractJoin = YorubaTables.particles["subtractJoin"]!
                return "\(nextBase) \(subtractJoin) \(YorubaTables.traditional0to99[deficit] ?? String(deficit))"
            }
            let base = YorubaTables.hundredsBase[hundredCount * 100] ?? String(hundredCount * 100)
            if remainder == 0 { return base }
            let addJoin = YorubaTables.particles["addJoin"]!
            return "\(base) \(addJoin) \(YorubaTables.traditional0to99[remainder] ?? String(remainder))"
        }
        let hundredWord = hundredCount == 1
            ? (YorubaTables.tensBase[100] ?? "Ọgọ́rùn-ún")
            : "\(YorubaTables.tensBase[100] ?? "Ọgọ́rùn-ún") \(asMultiplier(hundredCount, mode: .modern))"
        if remainder == 0 { return hundredWord }
        return "\(hundredWord) \(YorubaTables.particles["modernJoin"]!) \(modernUnder100(remainder))"
    }

    /// Modern decimal-additive form for 0–99: "[tens] àti [units]".
    private static func modernUnder100(_ n: Int) -> String {
        if n <= 10 { return YorubaTables.base0to10[n] ?? String(n) }
        if n <= 14 { return YorubaTables.traditional0to99[n] ?? String(n) }
        if let t = YorubaTables.tensBase[n] { return t }
        let tens = (n / 10) * 10
        let units = n % 10
        let tensWord = tens == 10 ? (YorubaTables.base0to10[10] ?? String(tens)) : (YorubaTables.tensBase[tens] ?? String(tens))
        if units == 0 { return tensWord }
        return "\(tensWord) \(YorubaTables.particles["modernJoin"]!) \(YorubaTables.base0to10[units] ?? String(units))"
    }

    /// Multiplier after a scale or hundred word: "kan" for 1, else the
    /// number word with a lower-cased leading character so it reads as a modifier.
    private static func asMultiplier(_ n: Int, mode: YorubaMode) -> String {
        if n == 1 { return YorubaTables.particles["one"]! }
        let word = toWords(n, mode: mode)
        return lowerFirst(word)
    }

    private static func lowerFirst(_ word: String) -> String {
        word.prefix(1).lowercased() + word.dropFirst()
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

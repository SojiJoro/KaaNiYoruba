// Kàá — Swift number engine tests
// ---------------------------------------------------------------------------
// Mirrors src/lib/yorubaNumbers.test.ts (web app, repo root). Add to XCTest target.

import XCTest
@testable import Kaa

final class YorubaNumberEngineTests: XCTestCase {
    func test_units_0_to_10() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(0), "Òdo")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(1), "Ọ̀kan")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(2), "Méjì")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(5), "Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(9), "Mẹ́sàn-án")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(10), "Mẹ́wàá")
    }

    func test_teens() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(11), "Mọ́kànlá")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(14), "Mẹ́rìnlá")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(15), "Mẹ́ẹ̀dógún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(19), "Mọ́kàndínlógún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(20), "Ogún")
    }

    func test_spec_examples() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(35), "Márùndínlógójì")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(45), "Márùndínláàádọ́ta")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(75), "Márùndínlọ́gọ́rin")
    }

    func test_modern_mode() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(15, mode: .modern), "Mẹ́wàá àti Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(25, mode: .modern), "Ogún àti Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(35, mode: .modern), "Ọgbọ̀n àti Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(75, mode: .modern), "Àádọ́rin àti Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(11, mode: .modern), "Mọ́kànlá")
    }

    func test_round_tens() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(30), "Ọgbọ̀n")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(40), "Ogójì")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(50), "Àádọ́ta")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(70), "Àádọ́rin")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(80), "Ọgọ́rin")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(100), "Ọgọ́rùn-ún")
    }

    func test_hundreds() {
        XCTAssertEqual(YorubaNumberEngine.toYoruba(200), "Igba")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(300), "Ọ̀ọ́dúnrún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(400), "Irinwó")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(500), "Ẹ̀ẹ́dẹ́gbẹ̀ta")
    }

    func test_hundreds_with_remainder() {
        // Base-first "ó lé" (traditional), "àti" (modern)
        XCTAssertEqual(YorubaNumberEngine.toYoruba(105), "Ọgọ́rùn-ún ó lé Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(250), "Igba ó lé Àádọ́ta")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(555), "Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Márùndínlọ́gọ́ta")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(105, mode: .modern), "Ọgọ́rùn-ún àti Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(250, mode: .modern), "Ọgọ́rùn-ún méjì àti Àádọ́ta")
    }

    func test_o_din_subtractive_joins() {
        // Just under the next hundred reads "ó dín" (doc §11, §15)
        XCTAssertEqual(YorubaNumberEngine.toYoruba(199), "Igba ó dín Ọ̀kan")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(595), "Ẹgbẹ̀ta ó dín Márùn-ún")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(995), "Ẹgbẹ̀rún ó dín Márùn-ún")
    }

    func test_classical_units() {
        // Exact classical values only (doc §9, §15)
        XCTAssertEqual(YorubaNumberEngine.toYoruba(2000), "Ẹgbàá")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(4000), "Ẹgbàájì")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(20000), "Ọkẹ́ kan")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(40000), "Ọkẹ́ méjì")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(2000, mode: .modern), "Ẹgbẹ̀rún méjì")
    }

    func test_thousands_and_beyond() {
        // Generated, never digit-spelled
        XCTAssertEqual(YorubaNumberEngine.toYoruba(1000), "Ẹgbẹ̀rún kan")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(1001), "Ẹgbẹ̀rún kan ó lé Ọ̀kan")
        XCTAssertEqual(YorubaNumberEngine.toYoruba(1_000_000), "Mílíọ̀nù kan")
        XCTAssertEqual(
            YorubaNumberEngine.toYoruba(1_258_222),
            "Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún"
        )
    }

    func test_ordinals() {
        XCTAssertEqual(YorubaNumberEngine.toYorubaOrdinal(1), "Àkọ́kọ́")
        XCTAssertEqual(YorubaNumberEngine.toYorubaOrdinal(2), "Ìkejì")
        XCTAssertEqual(YorubaNumberEngine.toYorubaOrdinal(10), "Ìkẹwàá")
        XCTAssertEqual(YorubaNumberEngine.toYorubaOrdinal(11), "Ipò mọ́kànlá")
    }

    func test_naira() {
        XCTAssertEqual(YorubaNumberEngine.nairaToYoruba(500), "náírà ẹ̀ẹ́dẹ́gbẹ̀ta")
        XCTAssertEqual(YorubaNumberEngine.nairaToYoruba(12.5), "náírà méjìlá àti kọ́bọ̀ àádọ́ta")
    }

    func test_property_unique_names_0_to_9999() {
        // Uniqueness is the round-trip property — if two numbers shared a name,
        // Yorùbá → number would be ambiguous. Mirrors the web property test.
        for mode in [YorubaMode.traditional, .modern] {
            var seen: [String: Int] = [:]
            for n in 0...9999 {
                let word = YorubaNumberEngine.toYoruba(n, mode: mode)
                XCTAssertFalse(word.isEmpty, "\(mode)(\(n)) is empty")
                XCTAssertNil(seen[word], "\(mode): \(n) and \(seen[word]!) share \"\(word)\"")
                seen[word] = n
            }
        }
    }

    func test_operator_words() {
        XCTAssertEqual(YorubaNumberEngine.operatorWord("+"), "pẹ̀lú")
        XCTAssertEqual(YorubaNumberEngine.operatorWord("−"), "yọ")
        XCTAssertEqual(YorubaNumberEngine.operatorWord("×"), "ìgbà")
        XCTAssertEqual(YorubaNumberEngine.operatorWord("÷"), "pín sí")
    }

    func test_expressions() {
        XCTAssertEqual(YorubaNumberEngine.expressionToYoruba("2+2"), "Méjì pẹ̀lú Méjì")
        XCTAssertEqual(YorubaNumberEngine.expressionToYoruba("12×3"), "Méjìlá ìgbà Mẹ́ta")
        XCTAssertEqual(YorubaNumberEngine.expressionToYoruba("10−4"), "Mẹ́wàá yọ Mẹ́rin")
    }
}

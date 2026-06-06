// Káà — Swift number engine tests
// ---------------------------------------------------------------------------
// Mirrors web/src/lib/yorubaNumbers.test.ts. Add the file to a XCTest target.

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
        XCTAssertEqual(YorubaNumberEngine.toYoruba(1000), "Ẹgbẹ̀rún")
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

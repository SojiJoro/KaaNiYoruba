// Káà — Calculator view-model
// ---------------------------------------------------------------------------
// Mirrors src/lib/calculator.ts (in the web app at the repo root). Owns the
// expression string, evaluated
// result, error state, and history. SwiftUI views observe via @Observable.

import Foundation
import SwiftUI
import AVFoundation

public enum CalcKey: String, Hashable {
    case d0 = "0", d1 = "1", d2 = "2", d3 = "3", d4 = "4"
    case d5 = "5", d6 = "6", d7 = "7", d8 = "8", d9 = "9"
    case dot = "."
    case plus = "+"
    case minus = "−"
    case times = "×"
    case divide = "÷"
    case equals = "="
    case clear = "C"
    case back = "⌫"

    var isDigit: Bool { Int(rawValue) != nil }
    var isOperator: Bool {
        ["+", "−", "×", "÷"].contains(rawValue)
    }
}

public struct HistoryEntry: Identifiable, Hashable {
    public let id = UUID()
    public let expression: String
    public let expressionYoruba: String
    public let result: Double
    public let resultYoruba: String
    public let timestamp: Date
}

@MainActor
public final class CalculatorViewModel: ObservableObject {
    @Published public var expression: String = ""
    @Published public var lastResult: Double? = nil
    @Published public var error: String? = nil
    @Published public var mode: YorubaMode = .traditional
    @Published public var history: [HistoryEntry] = []

    private let speaker = AVSpeechSynthesizer()

    public init() {}

    // MARK: Derived view state

    public var expressionYoruba: String {
        YorubaNumberEngine.expressionToYoruba(expression, mode: mode)
    }

    public var previewResult: Double? {
        if let r = lastResult, expression == Self.formatNumber(r) { return r }
        guard !expression.isEmpty else { return nil }
        return Self.evaluate(expression).value
    }

    public var headlineYoruba: String {
        if error != nil { return "" }
        if let r = lastResult, expression == Self.formatNumber(r) {
            return YorubaNumberEngine.toYoruba(Int(r.rounded(.towardZero)), mode: mode)
        }
        guard let last = lastOperand(of: expression), let n = Double(last) else { return "" }
        return YorubaNumberEngine.toYoruba(Int(n.rounded(.towardZero)), mode: mode)
    }

    public var headlineArabic: String {
        if let r = lastResult, expression == Self.formatNumber(r) {
            return Self.formatNumber(r)
        }
        return lastOperand(of: expression) ?? ""
    }

    // MARK: Input

    public func apply(_ key: CalcKey) {
        error = nil

        switch key {
        case .clear:
            expression = ""
            lastResult = nil
            return
        case .back:
            if !expression.isEmpty { expression.removeLast() }
            return
        case .equals:
            let result = Self.evaluate(expression)
            if let value = result.value {
                let exprBefore = expression
                let yorubaBefore = expressionYoruba
                let yorubaResult = YorubaNumberEngine.toYoruba(Int(value.rounded(.towardZero)), mode: mode)
                expression = Self.formatNumber(value)
                lastResult = value
                history.insert(
                    HistoryEntry(
                        expression: exprBefore,
                        expressionYoruba: yorubaBefore,
                        result: value,
                        resultYoruba: yorubaResult,
                        timestamp: Date()
                    ),
                    at: 0
                )
                if history.count > 50 { history.removeLast(history.count - 50) }
            } else {
                error = result.error
            }
            return
        default: break
        }

        if key.isDigit || key == .dot {
            // Prevent multiple decimals in the current operand.
            if key == .dot {
                let lastOp = expression.lastIndex(where: { "+−×÷".contains($0) })
                let current = lastOp.flatMap { expression.index($0, offsetBy: 1, limitedBy: expression.endIndex) }
                let operand = current.map { String(expression[$0...]) } ?? expression
                if operand.contains(".") { return }
                if operand.isEmpty { expression += "0."; return }
            }
            if let r = lastResult, expression == Self.formatNumber(r) {
                expression = key.rawValue
                lastResult = nil
            } else {
                expression += key.rawValue
            }
            return
        }

        if key.isOperator {
            if expression.isEmpty {
                if key == .minus { expression = "−" }
                return
            }
            if let last = expression.last, "+−×÷".contains(last) {
                expression.removeLast()
                expression.append(key.rawValue)
                return
            }
            expression.append(key.rawValue)
        }
    }

    public func clearHistory() { history.removeAll() }

    public func reuse(_ entry: HistoryEntry) {
        expression = entry.expression
        lastResult = nil
        error = nil
    }

    public func speak(_ text: String) {
        guard !text.isEmpty else { return }
        // Placeholder: AVSpeechSynthesizer does not include a Yoruba voice on
        // most devices. Until recorded clips are bundled, fall back to the
        // closest available voice so the audio button is still functional.
        speaker.stopSpeaking(at: .immediate)
        let utter = AVSpeechUtterance(string: text)
        utter.voice = AVSpeechSynthesisVoice(language: "yo-NG")
            ?? AVSpeechSynthesisVoice(language: "en-NG")
            ?? AVSpeechSynthesisVoice.speechVoices().first
        utter.rate = 0.42
        speaker.speak(utter)
    }

    // MARK: Pure helpers

    private func lastOperand(of expr: String) -> String? {
        guard !expr.isEmpty else { return nil }
        let split = expr.split(whereSeparator: { "+−×÷".contains($0) })
        return split.last.map(String.init)
    }

    public static func formatNumber(_ n: Double) -> String {
        if !n.isFinite { return "—" }
        if n == n.rounded() { return String(Int(n)) }
        let f = NumberFormatter()
        f.minimumFractionDigits = 0
        f.maximumFractionDigits = 6
        f.usesGroupingSeparator = false
        return f.string(from: NSNumber(value: n)) ?? String(n)
    }

    // MARK: Expression evaluator (shunting-yard)

    public struct EvalResult {
        public let value: Double?
        public let error: String?
    }

    public static func evaluate(_ raw: String) -> EvalResult {
        var expr = raw
        while let last = expr.last, "+−×÷".contains(last) { expr.removeLast() }
        if expr.isEmpty { return EvalResult(value: 0, error: nil) }
        do {
            let tokens = try tokenize(expr)
            let rpn = toRPN(tokens)
            let value = try evalRPN(rpn)
            if !value.isFinite { return EvalResult(value: nil, error: "Àṣìṣe") }
            return EvalResult(value: value, error: nil)
        } catch {
            return EvalResult(value: nil, error: (error as? CalcError)?.message ?? "Àṣìṣe")
        }
    }

    enum CalcError: Error {
        case divisionByZero
        case syntax
        var message: String {
            switch self {
            case .divisionByZero: return "Pípín pẹ̀lú òdo"
            case .syntax: return "Àṣìṣe"
            }
        }
    }

    enum Token: Equatable {
        case num(Double)
        case op(Character)
    }

    static func tokenize(_ expr: String) throws -> [Token] {
        var tokens: [Token] = []
        var buf = ""
        for ch in expr {
            if ch.isNumber || ch == "." {
                buf.append(ch); continue
            }
            if "+−×÷".contains(ch) {
                if ch == "−" && (buf.isEmpty && (tokens.isEmpty || isOpToken(tokens.last!))) {
                    buf.append("-"); continue
                }
                if !buf.isEmpty {
                    guard let value = Double(buf) else { throw CalcError.syntax }
                    tokens.append(.num(value))
                    buf = ""
                }
                tokens.append(.op(ch))
                continue
            }
            throw CalcError.syntax
        }
        if !buf.isEmpty {
            guard let value = Double(buf) else { throw CalcError.syntax }
            tokens.append(.num(value))
        }
        return tokens
    }

    private static func isOpToken(_ t: Token) -> Bool {
        if case .op = t { return true }
        return false
    }

    private static func precedence(_ c: Character) -> Int {
        switch c {
        case "+", "−": return 1
        case "×", "÷": return 2
        default: return 0
        }
    }

    static func toRPN(_ tokens: [Token]) -> [Token] {
        var output: [Token] = []
        var ops: [Character] = []
        for token in tokens {
            switch token {
            case .num: output.append(token)
            case .op(let c):
                while let top = ops.last, precedence(top) >= precedence(c) {
                    output.append(.op(top))
                    ops.removeLast()
                }
                ops.append(c)
            }
        }
        while let top = ops.last {
            output.append(.op(top))
            ops.removeLast()
        }
        return output
    }

    static func evalRPN(_ rpn: [Token]) throws -> Double {
        var stack: [Double] = []
        for token in rpn {
            switch token {
            case .num(let v): stack.append(v)
            case .op(let c):
                guard let b = stack.popLast(), let a = stack.popLast() else {
                    throw CalcError.syntax
                }
                switch c {
                case "+": stack.append(a + b)
                case "−": stack.append(a - b)
                case "×": stack.append(a * b)
                case "÷":
                    if b == 0 { throw CalcError.divisionByZero }
                    stack.append(a / b)
                default: throw CalcError.syntax
                }
            }
        }
        return stack.first ?? 0
    }
}

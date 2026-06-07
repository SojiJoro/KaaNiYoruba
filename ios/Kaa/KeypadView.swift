// Kàá — Keypad
// ---------------------------------------------------------------------------
// 4-column grid of large, accessible calculator buttons. Uses SwiftUI Grid
// (iOS 16+) so the wide "0" key can claim two columns natively.

import SwiftUI

struct KeypadView: View {
    @ObservedObject var vm: CalculatorViewModel
    @Environment(\.colorScheme) private var scheme

    private struct Cell: Hashable {
        let key: CalcKey
        let variant: Variant
        var span: Int = 1
    }

    private enum Variant { case digit, op, fn, equals }

    private let rows: [[Cell]] = [
        [
            Cell(key: .clear, variant: .fn),
            Cell(key: .back, variant: .fn),
            Cell(key: .divide, variant: .op),
            Cell(key: .times, variant: .op),
        ],
        [
            Cell(key: .d7, variant: .digit),
            Cell(key: .d8, variant: .digit),
            Cell(key: .d9, variant: .digit),
            Cell(key: .minus, variant: .op),
        ],
        [
            Cell(key: .d4, variant: .digit),
            Cell(key: .d5, variant: .digit),
            Cell(key: .d6, variant: .digit),
            Cell(key: .plus, variant: .op),
        ],
        [
            Cell(key: .d1, variant: .digit),
            Cell(key: .d2, variant: .digit),
            Cell(key: .d3, variant: .digit),
            Cell(key: .equals, variant: .equals),
        ],
        [
            Cell(key: .d0, variant: .digit, span: 2),
            Cell(key: .dot, variant: .digit),
        ],
    ]

    var body: some View {
        Grid(horizontalSpacing: 12, verticalSpacing: 12) {
            ForEach(rows.indices, id: \.self) { rowIndex in
                GridRow {
                    ForEach(rows[rowIndex], id: \.self) { cell in
                        button(for: cell)
                            .gridCellColumns(cell.span)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func button(for cell: Cell) -> some View {
        Button {
            vm.apply(cell.key)
        } label: {
            VStack(spacing: 4) {
                Text(cell.key.rawValue)
                    .font(.system(size: 30, weight: .semibold, design: .rounded))
                Text(subtitle(for: cell.key))
                    .font(.system(size: 12, design: .serif))
                    .opacity(0.85)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
            .frame(maxWidth: .infinity, minHeight: 72)
            .foregroundColor(foreground(for: cell.variant))
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(background(for: cell.variant))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(stroke(for: cell.variant), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(cell.key.rawValue), \(subtitle(for: cell.key))")
    }

    private func subtitle(for key: CalcKey) -> String {
        if key.isDigit { return YorubaNumberEngine.digitWord(key.rawValue, mode: vm.mode) }
        if key.isOperator { return YorubaNumberEngine.operatorWord(key.rawValue) }
        switch key {
        case .equals: return "dọ́gba"
        case .clear: return "parẹ́"
        case .back: return "pẹ̀yìn"
        case .dot: return "ààmì"
        default: return ""
        }
    }

    private func foreground(for variant: Variant) -> Color {
        switch variant {
        case .digit, .fn: return KaaTheme.text(scheme)
        case .op: return scheme == .dark ? KaaTheme.mossLight : KaaTheme.mossDark
        case .equals: return KaaTheme.cream
        }
    }

    private func background(for variant: Variant) -> Color {
        switch variant {
        case .digit: return KaaTheme.surface(scheme)
        case .op: return KaaTheme.moss.opacity(scheme == .dark ? 0.25 : 0.15)
        case .fn: return KaaTheme.text(scheme).opacity(0.05)
        case .equals: return KaaTheme.moss
        }
    }

    private func stroke(for variant: Variant) -> Color {
        switch variant {
        case .equals: return KaaTheme.mossDark
        case .op: return KaaTheme.moss.opacity(0.4)
        default: return KaaTheme.text(scheme).opacity(0.1)
        }
    }
}

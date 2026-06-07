// Kàá — Top-level calculator screen
// ---------------------------------------------------------------------------
// Owns the tab switcher and stitches the display, keypad, and ancillary
// panels together. Designed for iPhone first; safe-area aware.

import SwiftUI

enum KaaTab: String, CaseIterable, Identifiable {
    case calculator = "Kálkù"
    case history = "Ìtàn"
    case converter = "Yípadà"
    case learn = "Kọ́ ẹ̀kọ́"
    var id: String { rawValue }
}

struct CalculatorView: View {
    @StateObject private var vm = CalculatorViewModel()
    @State private var tab: KaaTab = .calculator
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        ZStack {
            KaaTheme.background(scheme).ignoresSafeArea()
            YorubaPatternBackground()
                .opacity(0.6)
                .allowsHitTesting(false)

            VStack(spacing: 16) {
                header

                Group {
                    switch tab {
                    case .calculator:
                        DisplayView(vm: vm)
                        KeypadView(vm: vm)
                    case .history:
                        HistoryView(vm: vm)
                    case .converter:
                        ConverterView(vm: vm)
                    case .learn:
                        LearningModeView(vm: vm)
                    }
                }
                .frame(maxWidth: .infinity)

                Spacer(minLength: 0)

                tabBar
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .frame(maxWidth: 480)
        }
    }

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 0) {
                Text("Kàá")
                    .font(.system(size: 36, weight: .bold, design: .serif))
                    .foregroundColor(KaaTheme.text(scheme))
                Text("Yoruba number & calculator")
                    .font(.caption)
                    .foregroundColor(KaaTheme.mutedText(scheme))
            }
            Spacer()
            ModeToggleView(mode: $vm.mode)
        }
    }

    private var tabBar: some View {
        HStack(spacing: 4) {
            ForEach(KaaTab.allCases) { item in
                Button {
                    withAnimation(.easeInOut(duration: 0.15)) { tab = item }
                } label: {
                    Text(item.rawValue)
                        .font(.system(.footnote, design: .serif))
                        .fontWeight(.semibold)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity)
                        .foregroundColor(tab == item ? KaaTheme.cream : KaaTheme.text(scheme).opacity(0.7))
                        .background(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(tab == item ? KaaTheme.moss : Color.clear)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(KaaTheme.text(scheme).opacity(0.05))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(KaaTheme.text(scheme).opacity(0.08), lineWidth: 1)
        )
    }
}

#Preview {
    CalculatorView()
}

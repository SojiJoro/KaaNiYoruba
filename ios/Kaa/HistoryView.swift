// Káà — History list

import SwiftUI

struct HistoryView: View {
    @ObservedObject var vm: CalculatorViewModel
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Ìtàn (History)")
                    .font(.system(.title3, design: .serif))
                    .foregroundColor(KaaTheme.text(scheme))
                Spacer()
                if !vm.history.isEmpty {
                    Button("Parẹ́") { vm.clearHistory() }
                        .foregroundColor(KaaTheme.rust)
                        .font(.footnote)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(KaaTheme.text(scheme).opacity(0.04))

            if vm.history.isEmpty {
                VStack(spacing: 6) {
                    Text("Kò sí ìtàn síbẹ̀.")
                        .font(.system(.body, design: .serif))
                        .foregroundColor(KaaTheme.mutedText(scheme))
                    Text("No history yet.")
                        .font(.footnote)
                        .foregroundColor(KaaTheme.mutedText(scheme))
                }
                .frame(maxWidth: .infinity, minHeight: 200)
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(vm.history) { entry in
                            Button { vm.reuse(entry) } label: {
                                row(for: entry)
                            }
                            .buttonStyle(.plain)
                            Divider().opacity(0.4)
                        }
                    }
                }
                .frame(maxHeight: 420)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(KaaTheme.surface(scheme))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(KaaTheme.text(scheme).opacity(0.08), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    @ViewBuilder
    private func row(for entry: HistoryEntry) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 8) {
                Text(entry.expression)
                Text("=")
                Text(CalculatorViewModel.formatNumber(entry.result))
                    .foregroundColor(KaaTheme.text(scheme))
                    .fontWeight(.semibold)
            }
            .font(.system(.footnote, design: .monospaced))
            .foregroundColor(KaaTheme.mutedText(scheme))

            (Text(entry.expressionYoruba) +
             Text(" dọ́gba ").foregroundColor(KaaTheme.mossDark) +
             Text(entry.resultYoruba).fontWeight(.semibold))
                .font(.system(.body, design: .serif))
                .foregroundColor(KaaTheme.text(scheme))
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

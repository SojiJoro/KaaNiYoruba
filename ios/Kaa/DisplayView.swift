// Kàá — Display view
// ---------------------------------------------------------------------------
// Renders the current expression (Arabic + Yoruba) plus a headline Yoruba
// result and a tiny Arabic numeral right-aligned.

import SwiftUI

struct DisplayView: View {
    @ObservedObject var vm: CalculatorViewModel
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(vm.expression.isEmpty ? " " : vm.expression)
                    .font(.system(.title3, design: .monospaced))
                    .foregroundColor(KaaTheme.mutedText(scheme))
                    .frame(minHeight: 24, alignment: .leading)
                Text(vm.expressionYoruba.isEmpty ? " " : vm.expressionYoruba)
                    .font(.system(.title2, design: .serif))
                    .foregroundColor(KaaTheme.text(scheme))
                    .frame(minHeight: 28, alignment: .leading)
            }

            HStack(alignment: .bottom) {
                Text(headline)
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    .foregroundColor(vm.error == nil ? KaaTheme.text(scheme) : KaaTheme.rust)
                    .minimumScaleFactor(0.45)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text(vm.headlineArabic)
                    .font(.system(.title3, design: .monospaced))
                    .foregroundColor(KaaTheme.mutedText(scheme))
                    .frame(minWidth: 36, alignment: .trailing)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, minHeight: 200, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(KaaTheme.surface(scheme))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(KaaTheme.text(scheme).opacity(0.08), lineWidth: 1)
        )
    }

    private var headline: String {
        if let err = vm.error { return err }
        return vm.headlineYoruba.isEmpty ? " " : vm.headlineYoruba
    }
}

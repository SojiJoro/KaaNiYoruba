// Kàá — Number converter pane

import SwiftUI

struct ConverterView: View {
    @ObservedObject var vm: CalculatorViewModel
    @State private var text: String = "25"
    @Environment(\.colorScheme) private var scheme

    private var parsed: Int? {
        guard let n = Int(text) else { return nil }
        guard (-1000...1000).contains(n) else { return nil }
        return n
    }

    private var yoruba: String {
        guard let n = parsed else { return "" }
        return YorubaNumberEngine.toYoruba(n, mode: vm.mode)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Yípadà Nọ́mbà")
                    .font(.system(.title2, design: .serif))
                    .foregroundColor(KaaTheme.text(scheme))
                Text("Tẹ nọ́mbà kan láàrín 0–1,000 láti rí ọ̀rọ̀ Yorùbá rẹ̀.")
                    .font(.footnote)
                    .foregroundColor(KaaTheme.mutedText(scheme))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Nọ́mbà")
                    .font(.footnote)
                    .foregroundColor(KaaTheme.mutedText(scheme))
                TextField("", text: $text)
                    .keyboardType(.numbersAndPunctuation)
                    .font(.system(.title, design: .monospaced))
                    .foregroundColor(KaaTheme.text(scheme))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(KaaTheme.text(scheme).opacity(0.05))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(KaaTheme.text(scheme).opacity(0.1), lineWidth: 1)
                    )
            }

            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("YORÙBÁ")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(1)
                        .foregroundColor(KaaTheme.mutedText(scheme))
                    Text(yoruba.isEmpty ? "—" : yoruba)
                        .font(.system(size: 32, weight: .semibold, design: .serif))
                        .foregroundColor(KaaTheme.text(scheme))
                        .lineLimit(3)
                        .minimumScaleFactor(0.5)
                }
                Spacer()
                Button { vm.speak(yoruba) } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.system(size: 18))
                        .foregroundColor(KaaTheme.moss)
                        .padding(12)
                        .background(KaaTheme.moss.opacity(0.18))
                        .clipShape(Circle())
                }
                .accessibilityLabel("Gbọ́ pípè")
            }

            Text("Àtọwọ́dọ́wọ́ (Traditional) lo èdè Yorùbá pẹ̀lú ìṣirò kí-kọ́. Òde-òní (Modern) nlo àfikún kàn nìkan.")
                .font(.caption)
                .foregroundColor(KaaTheme.mutedText(scheme))
                .padding(.top, 8)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(KaaTheme.surface(scheme))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(KaaTheme.text(scheme).opacity(0.08), lineWidth: 1)
        )
    }
}

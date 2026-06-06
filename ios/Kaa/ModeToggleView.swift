// Káà — Traditional / Modern mode segment control

import SwiftUI

struct ModeToggleView: View {
    @Binding var mode: YorubaMode
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        HStack(spacing: 4) {
            segment(title: "Àtọwọ́dọ́wọ́", subtitle: "Traditional", value: .traditional)
            segment(title: "Òde-òní", subtitle: "Modern", value: .modern)
        }
        .padding(4)
        .background(
            Capsule().fill(KaaTheme.text(scheme).opacity(0.06))
        )
    }

    @ViewBuilder
    private func segment(title: String, subtitle: String, value: YorubaMode) -> some View {
        let active = mode == value
        Button {
            withAnimation(.easeInOut(duration: 0.15)) { mode = value }
        } label: {
            VStack(spacing: 0) {
                Text(title)
                    .font(.system(size: 11, weight: .semibold, design: .serif))
                Text(subtitle)
                    .font(.system(size: 9, design: .serif))
                    .opacity(0.7)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundColor(active ? KaaTheme.cream : KaaTheme.text(scheme).opacity(0.7))
            .background(
                Capsule().fill(active ? KaaTheme.moss : Color.clear)
            )
        }
        .buttonStyle(.plain)
    }
}

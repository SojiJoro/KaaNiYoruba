// Kàá — Children's learning mode

import SwiftUI

struct LearningModeView: View {
    @ObservedObject var vm: CalculatorViewModel
    @Environment(\.colorScheme) private var scheme

    @State private var index = 0
    @State private var revealed = false
    @State private var picked: String? = nil
    @State private var right = 0
    @State private var total = 0

    private let rangeEnd = 20

    private var correct: String {
        YorubaNumberEngine.toYoruba(index, mode: vm.mode)
    }

    private var choices: [String] {
        var set: Set<String> = [correct]
        var pool = (0...rangeEnd).filter { $0 != index }
        // Deterministic shuffle by index so each card has stable options.
        pool.sort { a, b in
            let sa = (a * 9301 + index * 49297) % 233280
            let sb = (b * 9301 + index * 49297) % 233280
            return sa < sb
        }
        var i = 0
        while set.count < 4, i < pool.count {
            set.insert(YorubaNumberEngine.toYoruba(pool[i], mode: vm.mode))
            i += 1
        }
        return Array(set).sorted {
            let sa = ($0.count * 9301 + index * 49297) % 233280
            let sb = ($1.count * 9301 + index * 49297) % 233280
            return sa < sb
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Kọ́ Ẹ̀kọ́ (Learn)")
                        .font(.system(.title3, design: .serif))
                        .foregroundColor(KaaTheme.text(scheme))
                    Text("Nọ́mbà 0–\(rangeEnd) • Iye àbáyọ: \(right)/\(total)")
                        .font(.caption)
                        .foregroundColor(KaaTheme.mutedText(scheme))
                }
                Spacer()
                Button { next() } label: {
                    Text("Tókàn →")
                        .font(.footnote.weight(.semibold))
                        .foregroundColor(KaaTheme.cream)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Capsule().fill(KaaTheme.moss))
                }
                .buttonStyle(.plain)
            }

            VStack(spacing: 14) {
                Text("\(index)")
                    .font(.system(size: 88, weight: .bold, design: .monospaced))
                    .foregroundColor(KaaTheme.text(scheme))
                Group {
                    if revealed {
                        Text(correct)
                            .font(.system(.title, design: .serif))
                            .foregroundColor(KaaTheme.mossDark)
                    } else {
                        Button("Tẹ láti rí ìdáhùn") { revealed = true }
                            .font(.footnote)
                            .foregroundColor(KaaTheme.mutedText(scheme))
                    }
                }
                .frame(minHeight: 32)
                Button {
                    vm.speak(correct)
                } label: {
                    Label("Gbọ́ pípè", systemImage: "speaker.wave.2.fill")
                        .font(.footnote)
                        .foregroundColor(KaaTheme.mossDark)
                }
                .buttonStyle(.plain)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(KaaTheme.text(scheme).opacity(0.04))
            )

            Text("YAN ÌDÁHÙN TÓ TỌ́")
                .font(.system(size: 10, weight: .semibold))
                .tracking(1)
                .foregroundColor(KaaTheme.mutedText(scheme))

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)], spacing: 8) {
                ForEach(choices, id: \.self) { c in
                    choiceButton(c)
                }
            }
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

    @ViewBuilder
    private func choiceButton(_ choice: String) -> some View {
        let isPicked = picked == choice
        let isCorrect = choice == correct
        let showCorrect = revealed && isCorrect
        let showWrong = revealed && isPicked && !isCorrect

        let bg: Color = {
            if showCorrect { return KaaTheme.moss }
            if showWrong { return KaaTheme.rust.opacity(0.15) }
            return KaaTheme.surface(scheme)
        }()
        let fg: Color = {
            if showCorrect { return KaaTheme.cream }
            if showWrong { return KaaTheme.rust }
            return KaaTheme.text(scheme)
        }()

        Button {
            if picked != nil { return }
            picked = choice
            revealed = true
            total += 1
            if choice == correct { right += 1 }
        } label: {
            Text(choice)
                .font(.system(.body, design: .serif))
                .foregroundColor(fg)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous).fill(bg)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(KaaTheme.text(scheme).opacity(0.08), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .disabled(picked != nil)
    }

    private func next() {
        index = (index + 1) % (rangeEnd + 1)
        revealed = false
        picked = nil
    }
}

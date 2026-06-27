// Kàá — Color & font tokens
// ---------------------------------------------------------------------------
// Hex tokens map to the same palette used in the web app's tailwind.config.ts
// so the two implementations remain visually identical.

import SwiftUI

public enum KaaTheme {
    public static let paper        = Color(hex: 0xFAF7F0)
    public static let paperDark    = Color(hex: 0xEFE9DC)
    public static let cocoa        = Color(hex: 0x3D2417)
    public static let cocoaLight   = Color(hex: 0x5A3A26)
    public static let cocoaDark    = Color(hex: 0x2A1810)
    public static let cream        = Color(hex: 0xF5EBDF)
    public static let moss         = Color(hex: 0x7A9E7E)
    public static let mossDark     = Color(hex: 0x5D7E62)
    public static let mossLight    = Color(hex: 0xA3C2A7)
    public static let rust         = Color(hex: 0xB8623F)

    public static func background(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? cocoaDark : paper
    }

    public static func text(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? cream : cocoa
    }

    public static func mutedText(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? cream.opacity(0.6) : cocoa.opacity(0.6)
    }

    public static func surface(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? cocoa.opacity(0.5) : paper.opacity(0.85)
    }

    public static let serif: Font.Design = .serif
}

public extension Color {
    init(hex: UInt32, opacity: Double = 1.0) {
        let r = Double((hex >> 16) & 0xff) / 255
        let g = Double((hex >> 8) & 0xff) / 255
        let b = Double(hex & 0xff) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}

/// Subtle adire-style background pattern. Drawn with Canvas so we avoid
/// shipping a separate raster asset.
public struct YorubaPatternBackground: View {
    public init() {}
    public var body: some View {
        Canvas { ctx, size in
            let tile: CGFloat = 80
            let cols = Int(size.width / tile) + 2
            let rows = Int(size.height / tile) + 2
            let stroke = KaaTheme.moss.opacity(0.10)
            for row in 0..<rows {
                for col in 0..<cols {
                    let x = CGFloat(col) * tile
                    let y = CGFloat(row) * tile
                    var diamond = Path()
                    diamond.move(to: CGPoint(x: x, y: y + tile / 2))
                    diamond.addLine(to: CGPoint(x: x + tile / 2, y: y))
                    diamond.addLine(to: CGPoint(x: x + tile, y: y + tile / 2))
                    diamond.addLine(to: CGPoint(x: x + tile / 2, y: y + tile))
                    diamond.closeSubpath()
                    ctx.stroke(diamond, with: .color(stroke), lineWidth: 1)

                    var inner = Path()
                    inner.move(to: CGPoint(x: x + tile / 4, y: y + tile / 2))
                    inner.addLine(to: CGPoint(x: x + tile / 2, y: y + tile / 4))
                    inner.addLine(to: CGPoint(x: x + 3 * tile / 4, y: y + tile / 2))
                    inner.addLine(to: CGPoint(x: x + tile / 2, y: y + 3 * tile / 4))
                    inner.closeSubpath()
                    ctx.stroke(inner, with: .color(stroke), lineWidth: 1)

                    ctx.fill(
                        Path(ellipseIn: CGRect(x: x + tile / 2 - 2, y: y + tile / 2 - 2, width: 4, height: 4)),
                        with: .color(stroke)
                    )
                }
            }
        }
        .ignoresSafeArea()
    }
}

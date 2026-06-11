# Kàá — iOS

SwiftUI app for iPhone, iOS 16+. Shares the Yoruba number engine semantics with the web app, hand-ported to Swift.

## Xcode setup

The `ios/Kaa/` folder ships as plain Swift source — not a checked-in `.xcodeproj`. This keeps the repo lean and avoids merge conflicts on the project file. Set up a project once, drag the sources in.

### One-time project creation

1. Open **Xcode → File → New → Project…**
2. Choose **iOS → App**. Click *Next*.
3. Fill in:
   - **Product Name:** `Kaa`
   - **Interface:** SwiftUI
   - **Language:** Swift
   - **Minimum Deployments:** iOS 16.0
   - **Bundle Identifier:** `com.yourname.kaa` (your reverse-DNS)
4. Save the project at the repo root as `ios/Kaa.xcodeproj` (i.e. into the existing `ios/` folder). Xcode will create a `Kaa/` group next to the source files we already provide — delete Xcode's auto-generated `KaaApp.swift` and `ContentView.swift` to avoid duplicates.
5. In the Project Navigator, right-click the `Kaa` group → **Add Files to "Kaa"…** and add every file under `ios/Kaa/`:
   - `KaaApp.swift`
   - `YorubaNumberEngine.swift`
   - `CalculatorViewModel.swift`
   - `Theme.swift`
   - `CalculatorView.swift`
   - `DisplayView.swift`
   - `KeypadView.swift`
   - `ModeToggleView.swift`
   - `HistoryView.swift`
   - `ConverterView.swift`
   - `LearningModeView.swift`
6. Ensure **Copy items if needed** is unchecked (we want the project to reference files in-place) and **Add to targets: Kaa** is checked.
7. Add the test file: right-click the `KaaTests` group → **Add Files…** → `ios/KaaTests/YorubaNumberEngineTests.swift`. Target membership: `KaaTests` only.

### Build & run

- Select the `Kaa` scheme and an iPhone simulator (e.g. iPhone 15 Pro).
- ⌘R to build & run.
- ⌘U to run the test suite.

### Capabilities & assets

- **Display Name:** `Kàá`. Set in Target → General → Identity → Display Name. iOS will render the diacritic correctly.
- **Status bar:** light content in dark mode (handled automatically by SwiftUI).
- **App icon:** drop a 1024×1024 master into the `AppIcon` image set inside `Assets.xcassets`. The recommended icon concept is a deep brown `2` overlaid by a soft moss `Méjì` wordmark on a warm off-white field.

### Folder layout

```
ios/
├─ Kaa/
│  ├─ KaaApp.swift
│  ├─ YorubaNumberEngine.swift
│  ├─ CalculatorViewModel.swift
│  ├─ Theme.swift                    # palette + adire Canvas pattern
│  ├─ CalculatorView.swift           # top-level screen + tab bar
│  ├─ DisplayView.swift
│  ├─ KeypadView.swift
│  ├─ ModeToggleView.swift
│  ├─ HistoryView.swift
│  ├─ ConverterView.swift
│  └─ LearningModeView.swift
├─ KaaTests/
│  └─ YorubaNumberEngineTests.swift
└─ README.md
```

### Localising the bundle (optional)

Currently the Yoruba strings live inline in Swift source so the diacritics are version-controlled directly. To make the strings translatable in the future:

1. Add an `en.lproj/Localizable.strings` and a `yo.lproj/Localizable.strings`.
2. Replace user-facing literals with `NSLocalizedString(...)`.
3. In Target → Info → Localizations, add **Yoruba (yo)**.

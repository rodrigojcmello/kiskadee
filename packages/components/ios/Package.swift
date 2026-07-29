// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "KiskadeeIOS",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "KiskadeeIOS",
            targets: ["KiskadeeIOS"]
        )
    ],
    targets: [
        .target(
            name: "KiskadeeIOS",
            resources: [
                .process("Resources")
            ]
        )
    ]
)

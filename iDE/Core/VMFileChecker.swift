// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : VMFileChecker.swift
// Description : iDE VM Image Checker
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import Foundation
import XCTestDynamicOverlay

struct IDEVmFileCheckerResult: Equatable, Sendable {
    var alreadyInstalled: Bool
}

struct IDEVmFileChecker: Sendable {
    var check: @Sendable () async -> IDEVmFileCheckerResult
}

extension IDEVmFileChecker: DependencyKey {
    static let liveValue = Self(
        check: {
            let paths = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true)
            let libraryDirectory = paths[0]
            let libraryUrl = URL(string: libraryDirectory)!
            let vmPath = libraryUrl.appendingPathComponent("VM")

            if !FileManager.default.fileExists(atPath: vmPath.absoluteString) {
                do {
                    try FileManager.default.createDirectory(atPath: vmPath.absoluteString, withIntermediateDirectories: true, attributes: nil)
                } catch {
                    logger.info("\(error.localizedDescription)")
                }
            }

            let fdPath = vmPath.appendingPathComponent("efi_vars.fd")
            let imagePath = vmPath.appendingPathComponent("ide_vm.qcow2")

            let fdExist = FileManager.default.fileExists(atPath: fdPath.absoluteString)
            let imageExist = FileManager.default.fileExists(atPath: imagePath.absoluteString)

            return IDEVmFileCheckerResult(alreadyInstalled: fdExist && imageExist)
        }
    )
}

extension IDEVmFileChecker: TestDependencyKey {
    static let testValue = Self(
        check: unimplemented("\(Self.self).check")
    )
}

extension DependencyValues {
    var ideVmFileChecker: IDEVmFileChecker {
        get { self[IDEVmFileChecker.self] }
        set { self[IDEVmFileChecker.self] = newValue }
    }
}

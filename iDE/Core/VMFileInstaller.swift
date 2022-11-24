// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : VMFileInstaller.swift
// Description : iDE VM Image Installer (Download & Extract)
// Author: Dora Lee <lee@sanghun.io>

import Alamofire
import ComposableArchitecture
import Foundation
import XCTestDynamicOverlay

struct IDEVmFileInstaller: Sendable {
    var download: @Sendable (_ progressHandler: @MainActor @escaping (Int64, Int64) -> Void) async -> Data
    var install: @Sendable (Data) async -> Void
}

extension IDEVmFileInstaller: DependencyKey {
    static let liveValue = Self(
        download: { progressHandler in
            let downloadUrl = Bundle.main.object(forInfoDictionaryKey: "IDE_VM_DOWNLOAD_LINK") as! String
            let progressQueue = DispatchQueue(label: "io.sanghun.ide.network.progressQueue", qos: .utility)

            return await withUnsafeContinuation { continuation in
                AF.download(downloadUrl)
                    .downloadProgress(queue: progressQueue) { progress in
                        DispatchQueue.main.async {
                            progressHandler(progress.completedUnitCount, progress.totalUnitCount)
                        }
                    }
                    .responseData { response in
                        if let file = response.value {
                            continuation.resume(returning: file)
                        }
                    }
            }
        },
        install: { data in
            let paths = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true)
            let libraryDirectory = paths[0]
            let libraryUrl = URL(string: libraryDirectory)!
            let vmPath = libraryUrl.appendingPathComponent("VM")
            let imagePath = vmPath.appendingPathComponent("iDELinuxVM_aarch64_20221125.zip")

            await withUnsafeContinuation { continuation in
                DispatchQueue.global(qos: .userInitiated).async {
                    do {
                        try data.write(to: URL(fileURLWithPath: imagePath.absoluteString))
                    } catch {
                        print(error)
                    }
                    continuation.resume()
                }
            }
        }
    )
}

extension IDEVmFileInstaller: TestDependencyKey {
    static let testValue = Self(
        download: unimplemented("\(Self.self).download"),
        install: unimplemented("\(Self.self).install")
    )
}

extension DependencyValues {
    var ideVmFileInstaller: IDEVmFileInstaller {
        get { self[IDEVmFileInstaller.self] }
        set { self[IDEVmFileInstaller.self] = newValue }
    }
}

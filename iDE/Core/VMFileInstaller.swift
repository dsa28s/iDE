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
import ZipArchive

private var vmDirectoryPath: URL {
    let paths = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true)
    let libraryDirectory = paths[0]
    let libraryUrl = URL(string: libraryDirectory)!
    return libraryUrl.appendingPathComponent("VM")
}

private var imageZipFilePath: URL {
    vmDirectoryPath.appendingPathComponent("iDELinuxVM_aarch64_20221125.zip")
}

enum IDEVmFileInstallerError: Error {
    case extractError
}

struct IDEVmFileInstaller: Sendable {
    var download: @Sendable (_ progressHandler: @MainActor @escaping (Int64, Int64) -> Void) async -> Data
    var install: @Sendable (Data) async -> Void
    var extract: @Sendable (_ progressHandler: @MainActor @escaping (Double) -> Void) async -> Void
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
            await withUnsafeContinuation { continuation in
                DispatchQueue.global(qos: .userInitiated).async {
                    do {
                        try data.write(to: URL(fileURLWithPath: imageZipFilePath.absoluteString))
                        continuation.resume()
                    } catch {
                        logger.error("\(error)")
                    }
                }
            }
        },
        extract: { progressHandler in
            await withUnsafeContinuation { continuation in
                SSZipArchive.unzipFile(
                    atPath: imageZipFilePath.absoluteString,
                    toDestination: vmDirectoryPath.absoluteString,
                    progressHandler: { (_: String, _: unz_file_info, entryNumber: Int, total: Int) in
                        DispatchQueue.main.async {
                            progressHandler(Double(entryNumber) / Double(total) * 100)
                        }
                    },
                    completionHandler: { _, succeeded, error in
                        if succeeded {
                            continuation.resume()
                        } else {
                            logger.error("\(String(describing: error))")
                            // TODO: Error Handling
                        }
                    }
                )
            }
        }
    )
}

extension IDEVmFileInstaller: TestDependencyKey {
    static let testValue = Self(
        download: unimplemented("\(Self.self).download"),
        install: unimplemented("\(Self.self).install"),
        extract: unimplemented("\(Self.self).extract")
    )
}

extension DependencyValues {
    var ideVmFileInstaller: IDEVmFileInstaller {
        get { self[IDEVmFileInstaller.self] }
        set { self[IDEVmFileInstaller.self] = newValue }
    }
}

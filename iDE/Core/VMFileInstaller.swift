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
    var download: @Sendable (_ progressHandler: @escaping (Int) -> Void) async -> Data
}

iDE / Core / VMFileInstaller.swift
extension IDEVmFileInstaller: DependencyKey {
    static let liveValue = Self(
        download: { progressHandler in
            let downloadUrl = Bundle.main.object(forInfoDictionaryKey: "IDE_VM_DOWNLOAD_LINK") as! String
            let progressQueue = DispatchQueue(label: "io.sanghun.ide.network.progressQueue", qos: .utility)

            return await withUnsafeContinuation { continuation in
                AF.download(downloadUrl)
                    .downloadProgress(queue: progressQueue) { progress in
                        progressHandler(Int(progress.fractionCompleted * 100))
                    }
                    .responseData { response in
                        if let file = response.value {
                            print("===== DOWNLOAD COMPLETE")
                            print(file)
                            continuation.resume(returning: file)
                        }
                    }
            }
        }
    )
}

extension IDEVmFileInstaller: TestDependencyKey {
    static let testValue = Self(
        download: unimplemented("\(Self.self).download")
    )
}

extension DependencyValues {
    var ideVmFileInstaller: IDEVmFileInstaller {
        get { self[IDEVmFileInstaller.self] }
        set { self[IDEVmFileInstaller.self] = newValue }
    }
}

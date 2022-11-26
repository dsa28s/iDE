// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : VMProvisiong.swift
// Description : VM Provisioning Logic (TCA)
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import Foundation

typealias IDEVmProvisioningDownloadProgress = Int
typealias IDEVmProvisioningExtractingProgress = Int

struct IDEVMProvisioning: ReducerProtocol {
    @Dependency(\.ideVmFileChecker) var vmFileChecker
    @Dependency(\.ideVmFileInstaller) var vmFileInstaller

    enum ScreenState: Equatable {
        case initial
        case downloading
        case extracting
        case booting
    }

    struct State: Equatable {
        var screenState: ScreenState = .initial
        var currentDownloadOffset: Int64 = 0
        var totalDownloadSize: Int64 = 0
        var extractProgress: Int = 0
    }

    enum Action: Equatable {
        case check
        case download
        case downloading(currentOffset: Int64, totalSize: Int64)
        case extract
        case extracting(progress: Int)
        case bootVm
        case ready
    }

    var body: some ReducerProtocol<State, Action> {
        Reduce { state, action in
            switch action {
            case .check:
                return .task {
                    if await vmFileChecker.check().alreadyInstalled {
                        return .bootVm
                    } else {
                        return .download
                    }
                }
            case .download:
                state.screenState = .downloading
                return .run { subscriber in
                    let data = await vmFileInstaller.download { currentSize, totalSize in
                        subscriber.send(.downloading(currentOffset: currentSize, totalSize: totalSize))
                    }

                    await vmFileInstaller.install(data)
                    await subscriber.send(.extract)
                }
            case let .downloading(current, total):
                state.currentDownloadOffset = current
                state.totalDownloadSize = total
                return .none
            case .extract:
                state.screenState = .extracting
                return .run { subscriber in
                    await vmFileInstaller.extract { progress in
                        subscriber.send(.extracting(progress: Int(progress)))
                    }

                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        subscriber.send(.bootVm)
                    }
                }
            case let .extracting(progress):
                state.extractProgress = progress
                return .none
            case .bootVm:
                state.screenState = .booting
                return .none
            default:
                return .none
            }
        }
    }
}

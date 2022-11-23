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
        var progress: Int = 0
    }

    enum Action: Equatable {
        case check
        case download
        case extract
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
                return .task {
                    let data = await vmFileInstaller.download { progress in
                        print(progress)
                    }

                    return .extract
                }
            case .bootVm:
                state.screenState = .booting
                return .none
            default:
                return .none
            }
        }
    }
}

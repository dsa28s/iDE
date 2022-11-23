// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : iDEApp.swift
// Description : iDEApp Config / TCA Logic
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import SwiftUI

struct IDE: ReducerProtocol {
    enum State: Equatable {
        case licenseAgreement(IDELicenseAgreement.State)
        case jitChecker(IDEJITChecker.State)
        case vmProvisioning(IDEVMProvisioning.State)

        init() {
            self = .licenseAgreement(IDELicenseAgreement.State())
        }
    }

    enum Action: Equatable {
        case licenseAgreement(IDELicenseAgreement.Action)
        case jitChecker(IDEJITChecker.Action)
        case vmProvisioning(IDEVMProvisioning.Action)
    }

    var body: some ReducerProtocol<State, Action> {
        Reduce { state, action in
            switch action {
            case .licenseAgreement(.agreeLicense):
                state = .jitChecker(IDEJITChecker.State())
                return .none

            case .licenseAgreement:
                return .none

            case .jitChecker(.available):
                state = .vmProvisioning(IDEVMProvisioning.State())
                return .none

            case .jitChecker:
                return .none

            case .vmProvisioning(.ready):
                // TODO: 메인 화면으로 넘기기
                return .none

            case .vmProvisioning:
                return .none
            }
        }
        .ifCaseLet(/State.licenseAgreement, action: /Action.licenseAgreement) {
            IDELicenseAgreement()
        }
        .ifCaseLet(/State.jitChecker, action: /Action.jitChecker) {
            IDEJITChecker()
        }
        .ifCaseLet(/State.vmProvisioning, action: /Action.vmProvisioning) {
            IDEVMProvisioning()
        }
    }
}

@main
enum iDEMain {
    static var jitAvailable = true

    static func main() {
        if jb_spawn_ptrace_child(CommandLine.argc, CommandLine.unsafeArgv) {
            logger.info("JIT: ptrace() child spawn trick")
        } else if jb_has_jit_entitlement() {
            logger.info("JIT: found entitlement")
        } else if jb_has_cs_disabled() {
            logger.info("JIT: CS_KILL disabled")
        } else if jb_has_cs_execseg_allow_unsigned() {
            logger.info("JIT: CS_EXECSEG_ALLOW_UNSIGNED set")
        } else if jb_enable_ptrace_hack() {
            logger.info("JIT: ptrace() hack supported")
        } else {
            logger.info("JIT: ptrace() hack failed")
            jitAvailable = false
        }
        // raise memlimits on jailbroken devices
        if jb_increase_memlimit() {
            logger.info("MEM: successfully removed memory limits")
        }

        iDEApp.main()
    }
}

struct iDEApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(
                store: Store(
                    initialState: IDE.State(),
                    reducer: IDE()
                )
            )
        }
    }
}

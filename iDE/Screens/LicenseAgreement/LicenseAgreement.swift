// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : LicenseAgreement.swift
// Description : License Agreement (TCA)
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import Foundation
import SwiftyUserDefaults

extension DefaultsKeys {
    var isLicenseAgreed: DefaultsKey<Bool> { .init("isLicenseAgreed", defaultValue: false) }
}

struct LicenseAgreement: ReducerProtocol {
    struct State: Equatable {
        var isLicenseAgreed = Defaults[\.isLicenseAgreed]
        var pendingDisagreeSubmit = false
    }

    enum Action: Equatable {
        case agreeLicense // 약관 동의
        case disagreeLicense // 약관 미동의
        case confirmDisagreeLicense // 약관 미동의 최종
    }

    func reduce(into state: inout State, action: Action) -> EffectTask<Action> {
        switch action {
        case .agreeLicense:
            Defaults[\.isLicenseAgreed] = true
            state.isLicenseAgreed = true

            return .none
        case .disagreeLicense:
            state.pendingDisagreeSubmit = true
            return .none
        case .confirmDisagreeLicense:
            exit(0)
        }
    }
}

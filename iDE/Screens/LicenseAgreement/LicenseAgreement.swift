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
    }

    enum Action: Equatable {
        case agreeLicense // 약관 동의
        case disagreeLicense // 약관 미동의
    }

    func reduce(into state: inout State, action: Action) -> EffectTask<Action> {
        switch action {
        case .agreeLicense:
            Defaults[\.isLicenseAgreed] = true
            state.isLicenseAgreed = true

            return .none
        case .disagreeLicense:
            exit(0)
        }
    }
}

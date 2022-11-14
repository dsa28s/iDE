// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : JITUnavailable.swift
// Description : JIT Unavailable Modal Logic (TCA)
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import Foundation

struct IDEJITChecker: ReducerProtocol {
    struct State: Equatable {
        var isJITAvailable = iDEMain.jitAvailable
    }

    enum Action: Equatable {
        case available
        case unavailable
    }

    func reduce(into _: inout State, action: Action) -> EffectTask<Action> {
        switch action {
        case .unavailable:
            exit(0)
        default:
            return .none
        }
    }
}

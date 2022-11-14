// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : MainEntryPoint.swift
// Description : Main Entrypoint for iDE App
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import SheeKit
import SwiftUI

enum ScreenType {
    case licenseAgreement
    case jitCheck
    case engineInitialize
}

struct ContentView: View {
    let store: StoreOf<IDE>

    var body: some View {
        SwitchStore(self.store) {
            CaseLet(state: /IDE.State.licenseAgreement, action: IDE.Action.licenseAgreement) { store in
                WithViewStore(store, observe: { $0 }) { viewStore in
                    let isLicenseAgreed = viewStore.binding(get: \.isLicenseAgreed, send: .agreeLicense)

                    ZStack {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .controlSize(.large)
                    }.shee(
                        isPresented: !isLicenseAgreed,
                        presentationStyle: .formSheet(
                            properties: .init()
                        ),
                        presentedViewControllerParameters: createSheetParams(width: 700, height: 600)
                    ) {
                        IDELicenseAgreementDialogView(
                            onAgreed: { viewStore.send(.agreeLicense) },
                            onDisagreed: { viewStore.send(.disagreeLicense) }
                        )
                    }.onAppear {
                        if viewStore.isLicenseAgreed {
                            viewStore.send(.agreeLicense)
                        }
                    }
                }
            }
            CaseLet(state: /IDE.State.jitChecker, action: IDE.Action.jitChecker) { store in
                WithViewStore(store, observe: { $0 }) { viewStore in
                    let jitAvailable = viewStore.binding(get: \.isJITAvailable, send: .unavailable)

                    ZStack {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .controlSize(.large)
                    }.shee(
                        isPresented: !jitAvailable,
                        presentationStyle: .formSheet(
                            properties: .init()
                        ),
                        presentedViewControllerParameters: createSheetParams(width: 700, height: 365)
                    ) {
                        IDEJITAvailableDialogView(onConfirmed: { viewStore.send(.unavailable) })
                    }.onAppear {
                        if viewStore.isJITAvailable {
                            print("AVAILABLE")
                            viewStore.send(.available)
                        }
                    }
                }
            }
        }
    }

    private func createSheetParams(width: Int, height: Int) -> UIViewControllerProxy {
        var parameters = UIViewControllerProxy()
        parameters.preferredStatusBarUpdateAnimation = .fade
        parameters.isModalInPresentation = true
        parameters.modalTransitionStyle = .coverVertical
        parameters.preferredContentSize = .init(width: width, height: height)
        return parameters
    }
}

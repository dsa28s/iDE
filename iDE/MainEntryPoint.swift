// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : MainEntryPoint.swift
// Description : Main Entrypoint for iDE App
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import SheeKit
import SwiftUI

struct ContentView: View {
    let licenseAgreementStore: StoreOf<LicenseAgreement>

    var body: some View {
        WithViewStore(self.licenseAgreementStore, observe: { $0 }) { viewStore in
            ZStack {
                ProgressView()
                    .progressViewStyle(.circular)
                    .controlSize(.large)
            }.shee(
                isPresented: !viewStore.binding(get: \.isLicenseAgreed, send: .agreeLicense),
                presentationStyle: .formSheet(
                    properties: .init()
                ),
                presentedViewControllerParameters: presentedLicenseAgreementSheetParams
            ) {
                IDELicenseAgreementDialogView()
            }
        }
    }

    var presentedLicenseAgreementSheetParams: UIViewControllerProxy {
        var parameters = UIViewControllerProxy()
        parameters.preferredStatusBarUpdateAnimation = .fade
        parameters.isModalInPresentation = true
        parameters.modalTransitionStyle = .coverVertical
        parameters.preferredContentSize = .init(width: 700, height: 600)
        return parameters
    }
}

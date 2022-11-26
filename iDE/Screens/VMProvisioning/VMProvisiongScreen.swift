// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : VMProvisioningScreen.swift
// Description : VM Provisioning Screen
// Author: Dora Lee <lee@sanghun.io>

import ComposableArchitecture
import Foundation
import SwiftUI

struct IDEVMProvisioningScreen: View {
    let store: StoreOf<IDEVMProvisioning>

    var body: some View {
        WithViewStore(store, observe: { $0 }) { viewStore in
            if viewStore.screenState == .initial {
                IDEVMProvisioningInitialView(viewStore: viewStore)
            } else if viewStore.screenState == .downloading {
                IDEVMProvisioningDownloadVmView(viewStore: viewStore)
            } else if viewStore.screenState == .extracting {
                IDEVMProvisioningExtractVmView(viewStore: viewStore)
            } else if viewStore.screenState == .booting {
                IDEVMProvisioningBootVmView(viewStore: viewStore)
            }
        }
    }
}

private struct IDEVMProvisioningInitialView: View {
    let viewStore: ViewStoreOf<IDEVMProvisioning>

    var body: some View {
        VStack {
            ProgressView()
                .controlSize(.large)
                .padding(.vertical, 24)
                .onAppear {
                    viewStore.send(.check)
                }
            Text("VM_PROVISIONING_LOADING")
                .font(.title)
        }
    }
}

private struct IDEVMProvisioningDownloadVmView: View {
    let viewStore: ViewStoreOf<IDEVMProvisioning>

    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack {
            if colorScheme == .dark {
                IDELottieView(fileName: "download_animation.json")
                    .colorInvert()
                    .frame(width: 200, height: 200)
            } else {
                IDELottieView(fileName: "download_animation.json")
                    .frame(width: 200, height: 200)
            }
            HStack {
                Text("VM_PROVISIONING_DOWNLOADING")
                    .font(.title)
                    .padding(.trailing, 8)

                if viewStore.totalDownloadSize > 0 {
                    Text("\(Units(bytes: viewStore.currentDownloadOffset).getReadableUnit()) / \(Units(bytes: viewStore.totalDownloadSize).getReadableUnit())")
                        .font(.title)
                }
            }
            Text("VM_PROVISIONING_DOWNLOADING_DESCRIPTION")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.top, 12)
        }
    }
}

private struct IDEVMProvisioningExtractVmView: View {
    let viewStore: ViewStoreOf<IDEVMProvisioning>

    var body: some View {
        VStack {
            IDELottieView(fileName: "extract_animation.json")
                .scaleEffect(1.6)
                .frame(width: 200, height: 200)
            HStack {
                Text("VM_PROVISIONING_EXTRACTING")
                    .font(.title)
                    .padding(.trailing, 8)
                Text("\(viewStore.extractProgress)%")
                    .font(.title)
            }
        }
    }
}

private struct IDEVMProvisioningBootVmView: View {
    let viewStore: ViewStoreOf<IDEVMProvisioning>

    var body: some View {
        VStack {
            IDELottieView(fileName: "vm_provisioning_animation.json")
                .scaleEffect(1.6)
                .frame(width: 200, height: 200)
            Text("VM_PROVISIONING_BOOTING")
                .font(.title)
        }
    }
}

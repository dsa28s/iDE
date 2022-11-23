// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : VMProvisioningScreen.swift
// Description : VM Provisioning Screen
// Author: Dora Lee <lee@sanghun.io>

import Foundation
import SwiftUI
import ComposableArchitecture


struct IDEVMProvisioningScreen: View {
    let store: StoreOf<IDEVMProvisioning>
    
    var body: some View {
        WithViewStore(store, observe: { $0 }) { viewStore in
            if viewStore.screenState == .initial {
                IDEVMProvisioningInitialView(viewStore: viewStore)
            } else if viewStore.screenState == .downloading {
                IDEVMProvisioningDownloadVmView(viewStore: viewStore)
            }
        }
    }
}

fileprivate struct IDEVMProvisioningInitialView: View {
    
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

fileprivate struct IDEVMProvisioningDownloadVmView: View {
    
    let viewStore: ViewStoreOf<IDEVMProvisioning>
    
    var body: some View {
        VStack {
            IDELottieView(fileName: "download_animation.json")
                .frame(width: 200, height: 200)
            Text("VM_PROVISIONING_DOWNLOADING")
                .font(.title)
            Text("VM_PROVISIONING_DOWNLOADING_DESCRIPTION")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.top, 12)
        }
    }
}

fileprivate struct IDEVMProvisioningExtractVmView: View {
    let viewStore: ViewStoreOf<IDEVMProvisioning>
    
    var body: some View {
        VStack {
            IDELottieView(fileName: "extract_animation.json")
                .scaleEffect(1.6)
                .frame(width: 200, height: 200)
            Text("VM_PROVISIONING_DOWNLOADING")
                .font(.title)
        }
    }
}

fileprivate struct IDEVMProvisioningBootVmView: View {
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

// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : JITUnavailableDialogView.swift
// Description : JIT Unavailable Dialog
// Author: Dora Lee <lee@sanghun.io>

import SwiftUI

struct IDEJITAvailableDialogView: View {
    let onConfirmed: () -> Void

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading) {
                Image(systemName: "exclamationmark.circle.fill")
                    .resizable()
                    .foregroundColor(.red)
                    .frame(width: 36, height: 36)
                    .padding([.horizontal, .top], 20)
                Text("JIT_UNAVAILABLE_DESCRIPTION")
                    .padding(.top, 8)
                    .padding([.horizontal, .bottom], 20)
                Color.gray.opacity(0.3).frame(height: 1)
                HStack(alignment: .center) {
                    Spacer()

                    Button("COMMON_OK", role: .destructive) {
                        onConfirmed()
                    }.bold()
                        .padding([.leading, .trailing], 10)
                        .padding([.top, .bottom], 5)
                        .hoverEffect()
                }
                .padding([.leading, .trailing], 8)
                .frame(height: 48)
                .background(.white)
            }.navigationTitle(LocalizedStringKey("JIT_UNAVAILABLE_TITLE"))
        }
    }
}

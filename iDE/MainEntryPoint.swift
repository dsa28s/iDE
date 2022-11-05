// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : MainEntryPoint.swift
// Description : Main Entrypoint for iDE App
// Author: Dora Lee <lee@sanghun.io>

import SwiftUI

struct ContentView: View {
    var body: some View {
        ProgressView()
            .progressViewStyle(.circular)
            .controlSize(.large)
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif

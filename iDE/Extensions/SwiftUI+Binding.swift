// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : SwiftUI+Binding.swift
// Description : Binding Extension for Swift UI
// Author: Dora Lee <lee@sanghun.io>

import Foundation
import SwiftUI

prefix func ! (value: Binding<Bool>) -> Binding<Bool> {
    Binding<Bool>(
        get: { !value.wrappedValue },
        set: { value.wrappedValue = !$0 }
    )
}

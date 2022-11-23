// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : IDELottieView.swift
// Description : LottieView SwiftUI Wrapper (UIRepresentable)
// Author: Dora Lee <lee@sanghun.io>

import Foundation
import Lottie
import SwiftUI


struct IDELottieView: UIViewRepresentable {
    
    var fileName: String
    
    func makeUIView(context: UIViewRepresentableContext<IDELottieView>) -> UIView {
        let view = UIView(frame: .zero)
        let animationView = LottieAnimationView()
        animationView.animation = Animation.named(fileName)
        animationView.contentMode = .scaleToFill
        animationView.loopMode = .loop
        animationView.backgroundBehavior = .pauseAndRestore
        
        animationView.play()
        
        animationView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(animationView)
        
        NSLayoutConstraint.activate([
            animationView.widthAnchor.constraint(equalTo: view.widthAnchor),
            animationView.heightAnchor.constraint(equalTo: view.heightAnchor)
        ])
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: UIViewRepresentableContext<IDELottieView>) {
        
    }
}


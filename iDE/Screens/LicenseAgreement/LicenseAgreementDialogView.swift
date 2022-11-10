// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : LicenseAgreement.swift
// Description : License Agreement Dialog
// Author: Dora Lee <lee@sanghun.io>

import SwiftUI
import SwiftUITrackableScrollView

struct IDELicenseAgreementDialogView: View {
    @State var isAgreeButtonEnabled = false
    @State private var scrollViewContentOffset = CGFloat(0)

    var body: some View {
        NavigationStack {
            ZStack {
                VStack {
                    HStack {
                        Text("LICENSE_AGREEMENT_DESCRIPTION")
                            .font(.system(.body))
                        Spacer()
                    }.padding([.trailing, .leading], 20)
                    TrackableScrollView(.vertical, contentOffset: $scrollViewContentOffset) {
                        Text("""
                            iDE 프로젝트에 관심을 가져주셔서 감사합니다.<br /><br />

                            이 프로젝트는 M1 칩 이상이 달린 iPad에서 여러 언어에 대해 통합 개발 환경 (IDE) 을 구축하는 것을 목표로 하며, 현재 매우 실험적으로 진행 중인 프로젝트입니다. 그렇기에 언제나 프로젝트의 진행이 중단될 수 있습니다. 또한, <b>해당 프로젝트는 모두 본업이 있는 상태에서 비영리 목적으로 진행되는 사이드 프로젝트기 때문에 업데이트가 불규칙적으로 진행되거나 피드백 반영이 늦을 수 있습니다.</b>
                            <br /><br />
                            거의 모든 언어는 iPadOS 용으로 출시되지 않았을뿐더러, iPadOS 에서 네이티브로 실행되기에는 여러 가지 제약 사항이 많습니다. 이러한 문제를 해결하기 위해 iDE 프로젝트에서는 QEMU 기반의 arm64 에뮬레이터로 Alpine Linux를 호스팅하며, 호스팅 된 리눅스에서 모든 언어가 빌드되고 실행됩니다.<br />
                            이 뜻은 <b>일반적인 네이티브 환경에서 실행되는 속도보다 늦고, 기본적으로 CPU 리소스를 많이 활용한다는 의미입니다. 따라서 iDE를 실행할 때는 iPad가 충전기에 연결된 상태로 사용하시는 것을 권장합니다.</b>

                            <br /><br />
                            iDE에서 사용하는 에뮬레이팅 엔진인 QEMU가 원활하게 돌아가기 위해서는 JIT(Just-In-Time) 기능이 활성화 되어야 합니다. 하지만 iPadOS에서 시스템 앱이 아닌 서드파티 앱에는 허용하지 않고 있기 때문에 우회 방법을 사용해야 합니다.<br /><br />

                            우회 방법은 iDE 앱을 iDE Launcher 혹은 AltStore / JitterBug / JITStreamer를 통해 열어야 하며, 그렇지 않은 경우에는 iDE 앱을 사용할 수 없습니다.<br /><br />

                            iDE 프로젝트팀은 위 사항이 번거롭다는 것을 인지하고 있고 해결하려고 여러 가지 방법을 찾아보고 실험해보고 있습니다. 따라서 프로젝트 초기인 만큼 위 번거로움은 감수 부탁드립니다.<br /><br />

                            위 사항을 다 읽었으면 아래 계속 버튼을 눌러서 iDE를 사용하세요.
                            """.asAttributedString()!
                        )
                        .onChange(of: scrollViewContentOffset, perform: { newValue in
                            if newValue > 200 {
                                isAgreeButtonEnabled = true
                            }
                        })
                        .textSelection(.enabled)
                        .padding(20)
                        .padding(.bottom, 100)
                    }.background(.gray.opacity(0.2))
                }.navigationTitle(LocalizedStringKey("LICENSE_AGREEMENT"))

                VStack(spacing: 0) {
                    Spacer()
                    Color.gray.opacity(0.3).frame(height: 1)
                    HStack(alignment: .center) {
                        Button("동의하지 않음", role: .destructive) {}.bold()
                            .padding([.leading, .trailing], 10)
                            .padding([.top, .bottom], 5)
                            .hoverEffect()

                        Spacer()

                        Button("읽었으며 동의 함") {}.bold()
                            .padding([.leading, .trailing], 10)
                            .padding([.top, .bottom], 5)
                            .hoverEffect()
                            .disabled(!isAgreeButtonEnabled)
                    }
                    .padding([.leading, .trailing], 8)
                    .frame(height: 48)
                    .background(.white)
                }
            }
        }
    }
}

private struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = .zero
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value += nextValue()
    }
}

#if DEBUG
    struct IDELicenseAgreementDialogView_Preview: PreviewProvider {
        static var previews: some View {
            IDELicenseAgreementDialogView()
        }
    }
#endif

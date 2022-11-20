# iDE
IDE for iPadOS <br />
(English version coming soon)

<br />

## 프로젝트 목표

이 프로젝트는 M1 칩 이상이 달린 iPad에서 여러 언어에 대해 통합 개발 환경 (IDE) 을 구축하는 것을 목표로 하며, 현재 매우 실험적으로 진행 중인 프로젝트입니다. 그렇기에 언제나 프로젝트의 진행이 중단될 수 있습니다.

거의 모든 언어는 iPadOS 용으로 출시되지 않았을뿐더러, iPadOS 에서 네이티브로 실행되기에는 여러 가지 제약 사항이 많습니다. 이러한 문제를 해결하기 위해 iDE 프로젝트에서는 QEMU 기반의 x86_64 에뮬레이터로 Alpine Linux를 호스팅하며, 호스팅 된 리눅스에서 모든 언어가 빌드되고 실행됩니다.

아이패드를 개발 머신으로 사용할 수 있도록 하는 프로젝트입니다.

<br />

## 1차 지원하는 언어 (혹은 프레임워크 / 런타임 엔진)

아래 리스트는 1차로 지원할 iDE 프로젝트에서 공식적으로 지원하는 언어의 목표입니다. 목표에는 각 언어의 자동완성, Syntax Highlighting, Syntax Check, Run 을 목표로 합니다.

1차 목표가 완료되면 다른 언어도 구현할 예정입니다.

- [ ] Python 3
- [ ] TypeScript (js) / create-react-app
- [ ] Node.js Runtime

<br />

## 1차 에디터 목표

- [ ] Syntax Highlighting
- [ ] Syntax Checker + Annotation
- [ ] Find & Change
- [ ] Auto Completion

<br />

## 프로젝트에 관심이 있다면...

해당 프로젝트는 개인 사이드 프로젝트지만, 개인이 하기에는 규모가 큰 프로젝트입니다. 언제든 관심이 있으시다면 편하게 메일로 연락 주시면 감사드립니다. 또한, 개선사항 / 꼭 있었으면 좋겠다 하는 기능은 Issue 로 등록해주시면 감사드리겠습니다.

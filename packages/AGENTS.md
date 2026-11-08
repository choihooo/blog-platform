# 공유 패키지 작업 지침

- 공유 로직을 추가하기 전에 관련 패키지의 책임에 해당하는지 확인한다.
- 공개 API나 데이터 계약을 바꾸면 해당 패키지의 테스트·README와 실제 호출부·fixture, 관련
  `specs/*/contracts`를 함께 확인한다.
- 콘텐츠 저장·변환 계약을 바꾸면
  [콘텐츠 권위와 계약](../docs/development-guide.md#콘텐츠-권위와-계약)을 확인한다.
- 공개 URL·메타데이터·본문 렌더링·공유 SEO 로직을 바꾸면
  [SEO 검증 루프](../docs/development-guide.md#seo-검증-루프)를 적용한다.
- 검증과 완료 보고는 [개발 작업 가이드](../docs/development-guide.md#검증)를 따른다. 하위
  `AGENTS.md`에 필수 검사가 있으면 함께 실행한다.

# AI 공유 패키지 작업 지침

## 책임

이 패키지는 AI 기능의 경계와 feature flag 계약을 소유한다. 현재는 실제 콘텐츠 생성보다 패키지 경계와
검증 참여가 우선이다.

- AI 호출 구현을 이 패키지에 임의로 추가하지 않는다.
- 모델 제공자, 프롬프트, 개인정보 처리 정책은 별도 설계와 사용자 요청 없이 확정하지 않는다.
- 공개 API를 추가하면 `src/index.ts`, README, typecheck를 함께 갱신한다.
- 현재 `src/index.ts`는 `aiPackage` placeholder만 export한다. 실제 feature flag나 AI 호출 계약이
  생기기 전까지 provider SDK, prompt, runtime secret을 이 패키지에 추가하지 않는다.

## 검증

```sh
pnpm --filter @blog-platform/ai format:check
pnpm --filter @blog-platform/ai lint
pnpm --filter @blog-platform/ai typecheck
pnpm --filter @blog-platform/ai build
```

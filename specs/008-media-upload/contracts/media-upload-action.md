# Contract: Media Upload Action

## Purpose

CMS editor가 이미지 파일을 repository media 경로로 commit하고, editor에 반영할 공개 경로를 받기 위한
server action contract다.

## Operation: `uploadEditorMediaAction`

### Input

`FormData` payload:

| Field      | Type                    | Required | Description                              |
| ---------- | ----------------------- | -------- | ---------------------------------------- |
| `target`   | `"body"` 또는 `"cover"` | Yes      | 본문 이미지 또는 커버 이미지 대상        |
| `postSlug` | string                  | Yes      | 미디어 경로를 결정할 slug 또는 slug 후보 |
| `file`     | File                    | Yes      | 업로드할 이미지 파일                     |
| `alt`      | string                  | No       | 이미지 대체 텍스트                       |
| `title`    | string                  | No       | 이미지 제목                              |
| `caption`  | string                  | No       | 본문 이미지 caption                      |

### Success Result

```ts
type UploadEditorMediaSuccess = {
  ok: true;
  media: {
    path: string;
    publicPath: string;
    sha: string;
    commitId?: string;
    sizeBytes: number;
  };
  reference:
    | {
        target: "body";
        node: {
          type: "image";
          src: string;
          alt?: string;
          title?: string;
          caption?: string;
        };
      }
    | {
        target: "cover";
        coverImage: string;
      };
  message: string;
};
```

### Failure Result

```ts
type UploadEditorMediaFailure = {
  ok: false;
  code:
    | "validation-failure"
    | "slug-required"
    | "auth-required"
    | "forbidden"
    | "session-expired"
    | "temporary-connectivity"
    | "unknown";
  retryable: boolean;
  message: string;
};
```

## Rules

- Action은 기존 CMS 관리자 guard를 통과해야 한다.
- `file`이 없거나 2MB를 초과하거나 허용되지 않는 이미지면 `validation-failure`를 반환한다.
- `postSlug`가 비어 있거나 slug 후보를 만들 수 없으면 `slug-required`를 반환한다.
- 성공 전에는 editor document에 반영할 public path를 반환하지 않는다.
- 실패 결과는 blob URL, data URL, 로컬 파일 경로를 포함하지 않는다.
- 성공 결과의 `reference.node.src`와 `coverImage`는 `/media/`로 시작하는 공개 경로여야 한다.
- `target: "cover"`의 repository path는 `public/media/covers/<slug>-<hash>.webp` 형식을 따른다.
- `target: "body"`의 repository path는 `public/media/posts/<slug>/<hash>.webp` 형식을 따른다.

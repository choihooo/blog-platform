# Portfolio Mermaid Diagrams

포트폴리오 사례 설명에 사용할 다이어그램 원본과 렌더링 규칙입니다.

## HozUI token mapping

| Diagram role      | HozUI token                  | Value     |
| ----------------- | ---------------------------- | --------- |
| Canvas            | `--color-canvas-default`     | `#ffffff` |
| Subgraph          | `--color-canvas-subtle`      | `#f6f8fa` |
| Border            | `--color-border-default`     | `#d1d9e0` |
| Text              | `--color-fg-default`         | `#1f2328` |
| Muted text        | `--color-fg-muted`           | `#59636e` |
| Accent            | `--color-accent-emphasis`    | `#0969da` |
| Accent surface    | `--color-accent-subtle`      | `#ddf4ff` |
| Success           | `--color-success-emphasis`   | `#1a7f37` |
| Success surface   | `--color-success-subtle`     | `#dafbe1` |
| Attention         | `--color-attention-emphasis` | `#9a6700` |
| Attention surface | `--color-attention-subtle`   | `#fff8c5` |
| Danger            | `--color-danger-emphasis`    | `#d1242f` |
| Danger surface    | `--color-danger-subtle`      | `#ffebe9` |

## Render

```bash
pnpm dlx @mermaid-js/mermaid-cli \
  -i docs/diagrams/ai-workflow-architecture.mmd \
  -o apps/blog/public/projects/diagrams/ai-workflow-architecture.svg \
  -c docs/diagrams/mermaid-config.json \
  -C docs/diagrams/mermaid-theme.css \
  -p docs/diagrams/puppeteer-config.json \
  -b white
```

SVG는 확대 가능한 원본으로, PNG는 포트폴리오 이미지와 공유용 캡처로 사용합니다.

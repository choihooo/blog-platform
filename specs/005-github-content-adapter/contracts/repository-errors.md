# Contract: Repository Error Normalization

## Purpose

Repository, filesystem, validation, and network failures are normalized before CMS UI handles them.
This prevents raw transport details from leaking into user-facing flows and ensures failed edits are
recoverable.

## Error Categories

| Code                     | Meaning                                                  | Retryable | Required CMS Behavior                                        |
| ------------------------ | -------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| `unauthorized`           | The CMS cannot access or write the repository            | No        | Ask operator to re-authenticate or check repository access   |
| `missing-file`           | The target file no longer exists                         | No        | Prompt operator to reload before saving                      |
| `duplicate-file`         | Create requested a path that already exists              | No        | Ask operator to choose a different slug/path or reload       |
| `stale-file`             | `expectedSha` no longer matches the repository file      | No        | Preserve submitted content and show conflict state           |
| `rate-limit`             | Repository provider is throttling requests               | Yes       | Preserve submitted content and suggest retry after wait      |
| `validation-failure`     | Path, payload, or content validation failed              | No        | Show validation details and keep edit state                  |
| `temporary-connectivity` | Network or provider availability interrupted the request | Yes       | Preserve submitted content and offer retry                   |
| `unknown`                | Failure cannot be categorized                            | Maybe     | Preserve submitted content and show generic recovery message |

## Normalization Rules

- Any stale SHA or provider conflict response maps to `stale-file`.
- Create on an existing path maps to `duplicate-file`.
- Update/delete without `expectedSha` maps to `validation-failure`.
- Disallowed path or path traversal maps to `validation-failure`.
- Authentication or permission failure maps to `unauthorized`.
- Primary or secondary rate limit responses map to `rate-limit`.
- Timeout and transient network failures map to `temporary-connectivity`.
- Provider responses that hide private resources as not found may map to `unauthorized` when current
  repository configuration indicates the path should exist but authentication is missing or invalid.

## Preservation Requirement

For create, update, delete, and media operations, the normalized error includes the submitted
content or enough request context for CMS to keep the operator's current edit available for retry or
manual recovery. No failed operation may clear the editor state.

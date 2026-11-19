"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useBackLayer } from "../../lib/navigation/use-back-layer";
import type { Ledger, Command, Group, Category, Payment } from "../../domain/types";
import type { Confirmation } from "../../components/confirm-dialog";
import { EntityDrawer, type EditorTarget } from "./entity-drawer";
import { ReorderList } from "./reorder-list";
export function SettingsView({
  ledger,
  onCommand,
  onConfirm,
}: {
  ledger: Ledger;
  onCommand: (c: Command) => Promise<void>;
  onConfirm: (c: Confirmation) => void;
}) {
  const [tab, setTab] = useState<"category" | "payment">("category"),
    [editor, setEditor] = useState<EditorTarget | null>(null),
    [openGroup, setOpenGroup] = useState(""),
    [ordering, setOrdering] = useState(false),
    [showHidden, setShowHidden] = useState(false),
    [manageGroups, setManageGroups] = useState(false),
    [error, setError] = useState("");
  useBackLayer(manageGroups, () => setManageGroups(false));
  useBackLayer(ordering, () => setOrdering(false));
  const groups = [...ledger.groups]
    .filter((g) => showHidden || g.active)
    .sort((a, b) => a.order - b.order);
  const payments = [...ledger.payments]
    .filter((p) => showHidden || p.active)
    .sort((a, b) => a.order - b.order);
  const expandedGroup = groups.find((g) => g.id === openGroup);
  const reorder = async (
    entity: "group" | "category" | "payment",
    ids: string[],
  ) => {
    setError("");
    try {
      await onCommand({ type: "reorder-items", entity, ids });
    } catch (e) {
      setError(e instanceof Error ? e.message : "순서를 바꾸지 못했어요.");
      throw e;
    }
  };
  const editRow = (
    item: Group | Category | Payment,
    entity: EditorTarget["entity"],
  ) => (
    <Button
      key={item.id}
      type="button"
      variant="ghost"
      className="settings-item"
      aria-label={`${item.name}${entity === "group" ? " 그룹" : ""} 수정`}
      onClick={() => setEditor({ entity, id: item.id })}
    >
      <span>
        {item.name}
        {!item.active && <small className="settings-hidden-badge">숨김</small>}
      </span>
      <ChevronRight aria-hidden="true" />
    </Button>
  );
  const changeTab = (next: "category" | "payment") => {
    setTab(next);
    setOrdering(false);
    setManageGroups(false);
    setOpenGroup("");
    setError("");
  };
  return (
    <>
      <div className="settings-tabs">
        <div className="segmented">
          <Button
            type="button"
            variant="ghost"
            className={tab === "category" ? "active" : ""}
            aria-pressed={tab === "category"}
            onClick={() => changeTab("category")}
          >
            카테고리
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={tab === "payment" ? "active" : ""}
            aria-pressed={tab === "payment"}
            onClick={() => changeTab("payment")}
          >
            결제수단
          </Button>
        </div>
      </div>
      <section className="section settings-content">
        {manageGroups ? (
          <>
            <div className="section-head">
              <h2>그룹 관리</h2>
              <Button
                type="button"
                variant="ghost"
                className="text-btn"
                onClick={() => {
                  setOrdering(false);
                  setManageGroups(false);
                }}
              >
                돌아가기
              </Button>
            </div>
            {ordering ? (
              <ReorderList
                items={groups}
                onReorder={(ids) => reorder("group", ids)}
              />
            ) : (
              groups.map((g) => editRow(g, "group"))
            )}
            {!ordering && (
              <Button
                type="button"
                variant="secondary"
                className="secondary full settings-add"
                onClick={() => setEditor({ entity: "group" })}
              >
                <Plus />
                그룹 추가
              </Button>
            )}
          </>
        ) : tab === "category" ? (
          <>
            {groups.map((g) => {
              const categories = ledger.categories
                .filter((c) => c.groupId === g.id && (showHidden || c.active))
                .sort((a, b) => a.order - b.order);
              const expanded = openGroup === g.id;
              return (
                <div className="settings-group" key={g.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="settings-group-toggle"
                    aria-label={`${g.name} 그룹${!g.active ? " (숨김)" : ""}`}
                    aria-expanded={expanded}
                    aria-controls={`settings-group-${g.id}`}
                    onClick={() => setOpenGroup(expanded ? "" : g.id)}
                  >
                    <span>
                      {g.name}
                      {!g.active && (
                        <small className="settings-hidden-badge">숨김</small>
                      )}
                    </span>
                    <span className="settings-group-count">
                      {categories.length}개
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={expanded ? "is-expanded" : ""}
                    />
                  </Button>
                  {expanded && (
                    <div
                      id={`settings-group-${g.id}`}
                      className="settings-group-items"
                    >
                      {ordering ? (
                        <ReorderList
                          items={categories}
                          onReorder={(ids) => reorder("category", ids)}
                        />
                      ) : (
                        categories.map((c) => editRow(c, "category"))
                      )}
                      {!categories.length && (
                        <p className="settings-empty">
                          표시할 카테고리가 없어요.
                        </p>
                      )}
                      {!ordering && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-btn settings-inline-add"
                          aria-label={`${g.name} 카테고리 추가`}
                          onClick={() =>
                            setEditor({ entity: "category", parent: g.id })
                          }
                        >
                          <Plus />
                          카테고리 추가
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {!groups.length && (
              <p className="settings-empty">
                사용 중인 그룹이 없어요. 숨긴 항목을 확인하거나 그룹을 추가해
                주세요.
              </p>
            )}
            {!ordering && !expandedGroup && (
              <Button
                type="button"
                variant="secondary"
                className="secondary full settings-add"
                onClick={() => setEditor({ entity: "category" })}
              >
                <Plus />
                카테고리 추가
              </Button>
            )}
          </>
        ) : (
          <>
            {ordering ? (
              <ReorderList
                items={payments}
                onReorder={(ids) => reorder("payment", ids)}
              />
            ) : (
              payments.map((p) => editRow(p, "payment"))
            )}
            {!payments.length && (
              <p className="settings-empty">표시할 결제수단이 없어요.</p>
            )}
            {!ordering && (
              <Button
                type="button"
                variant="secondary"
                className="secondary full settings-add"
                onClick={() => setEditor({ entity: "payment" })}
              >
                <Plus />
                결제수단 추가
              </Button>
            )}
          </>
        )}
        <div className="settings-tools">
          <Button
            type="button"
            variant="ghost"
            className="text-btn"
            onClick={() => setOrdering(!ordering)}
          >
            {ordering ? "순서 편집 완료" : "순서 편집"}
          </Button>
          {!ordering && (
            <Button
              type="button"
              variant="ghost"
              className="text-btn"
              aria-pressed={showHidden}
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? "사용 중인 항목만" : "숨긴 항목 보기"}
            </Button>
          )}
          {tab === "category" && !manageGroups && !ordering && (
            <Button
              type="button"
              variant="ghost"
              className="text-btn"
              onClick={() => setManageGroups(true)}
            >
              그룹 관리
            </Button>
          )}
        </div>
        {ordering && (
          <p className="settings-hint">
            손잡이를 끌거나 위·아래 버튼으로 순서를 바꿔요.
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>
      {editor && (
        <EntityDrawer
          key={`${editor.entity}-${editor.id ?? "new"}`}
          ledger={ledger}
          target={editor}
          onClose={() => setEditor(null)}
          onCommand={onCommand}
          onConfirm={onConfirm}
        />
      )}
    </>
  );
}

import { Badge, Button, Chip, ChipGroup, EmptyState } from "@hozui/react";
import { ExternalLink, GitBranch, Globe2, ShieldCheck, Tags } from "lucide-react";
import { categoryTree } from "../../features/taxonomy/model/category-tree";
import type { TaxonomyData } from "../../features/taxonomy/model/contracts";
import { loadSettingsTaxonomy } from "../../features/taxonomy/server/queries";
import { taxonomyCommands } from "../actions/taxonomy-commands";

import { AccessState, CmsShell } from "../../components/shell/index";
import { CategoryManager } from "../../features/taxonomy/components/category-manager";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { loadSiteConfig, type SiteConfig } from "../../shared/server/site-config";
import { CmsTextField } from "../../shared/ui/text-field";
import { createTagAction } from "../actions/taxonomy-actions";

export function SettingsPageView({
  decision,
  siteConfig,
  taxonomy = { categories: [], tags: [] },
}: {
  decision: AccessDecision;
  siteConfig: SiteConfig;
  taxonomy?: TaxonomyData;
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }
  const tree = categoryTree(taxonomy.categories);

  return (
    <CmsShell activePath="/settings" session={decision.session} title="Settings">
      <div className="max-w-5xl space-y-9">
        <section>
          <p className="text-sm font-medium text-muted-foreground">Configuration</p>
          <h2 className="mt-1 text-3xl font-semibold">사이트 설정</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            현재 production에 연결된 사이트, GitHub 저장소, 관리자 정보를 확인합니다. 변경은
            저장소의 content/site.json에서 관리합니다.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Globe2 aria-hidden="true" size={17} />
              Public site
            </div>
            <p className="mt-5 text-lg font-semibold">{siteConfig.siteName}</p>
            <a
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              href={siteConfig.siteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {siteConfig.siteUrl}
              <ExternalLink aria-hidden="true" size={13} />
            </a>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <GitBranch aria-hidden="true" size={17} />
              Content repository
            </div>
            <p className="mt-5 font-mono text-sm">
              {siteConfig.github.owner}/{siteConfig.github.repo}
            </p>
            <div className="mt-2">
              <Badge label={siteConfig.github.branch} tone="neutral" variant="weak" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck aria-hidden="true" size={17} />
              CMS administrator
            </div>
            <p className="mt-5 font-medium">@{siteConfig.adminGithubLogin}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              GitHub user ID {siteConfig.adminGithubUserId}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm font-semibold">Analytics</p>
            <p className="mt-5 text-sm">{siteConfig.analytics.provider.toUpperCase()}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {siteConfig.analytics.ga4PropertyId === "replace-me"
                ? "GA4 property is not configured"
                : siteConfig.analytics.ga4PropertyId}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <CategoryManager commands={taxonomyCommands} groups={tree} />
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tags aria-hidden="true" size={17} />
              Tags
            </div>
            <form action={createTagAction} className="mt-5 grid gap-3">
              <CmsTextField label="Name" name="name" placeholder="Next.js" />
              <CmsTextField label="Slug" name="slug" placeholder="nextjs" />
              <Button className="w-fit" label="Add tag" type="submit" />
            </form>
            <ChipGroup aria-label="Tags" className="mt-5 flex flex-wrap gap-2">
              {taxonomy.tags.length > 0 ? (
                taxonomy.tags.map((tag) => (
                  <Chip key={tag.id} label={`${tag.name} / ${tag.slug}`} tone="neutral" />
                ))
              ) : (
                <EmptyState
                  density="compact"
                  description="Tags added to the repository will appear here."
                  title="No tags yet."
                />
              )}
            </ChipGroup>
          </div>
        </section>
      </div>
    </CmsShell>
  );
}

export default function SettingsPage() {
  return requireCmsAccess().then(async (decision) => {
    const siteConfig = await loadSiteConfig();
    if (decision.status !== "authorized") {
      return <SettingsPageView decision={decision} siteConfig={siteConfig} />;
    }
    return (
      <SettingsPageView
        decision={decision}
        siteConfig={siteConfig}
        taxonomy={await loadSettingsTaxonomy()}
      />
    );
  });
}

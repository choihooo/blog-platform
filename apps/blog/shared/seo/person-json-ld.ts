type PersonSite = {
  adminGithubLogin?: string;
  defaultAuthor: string;
  defaultAuthorAvatar?: string;
  defaultAuthorName: string;
  description: string;
  siteUrl: string;
};

function absoluteUrl(path: string, siteUrl: string) {
  return new URL(path, `${siteUrl.replace(/\/+$/, "")}/`).toString();
}

export function personJsonLd(site: PersonSite) {
  const resumeUrl = absoluteUrl("/resume", site.siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${resumeUrl}#person`,
    name: site.defaultAuthorName || site.defaultAuthor,
    alternateName: site.adminGithubLogin,
    description: "사용자 문제를 제품 경험으로 연결하는 프론트엔드 개발자",
    image: site.defaultAuthorAvatar
      ? absoluteUrl(site.defaultAuthorAvatar, site.siteUrl)
      : undefined,
    url: resumeUrl,
    sameAs: site.adminGithubLogin ? [`https://github.com/${site.adminGithubLogin}`] : undefined,
    jobTitle: "Frontend Developer",
  };
}

export function profilePageJsonLd(site: PersonSite) {
  const resumeUrl = absoluteUrl("/resume", site.siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: resumeUrl,
    mainEntity: personJsonLd(site),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

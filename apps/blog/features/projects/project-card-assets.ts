export const projectCardAssets: Partial<
  Record<
    string,
    {
      primary: string;
      primaryMode?: "visual" | "logo";
      secondary: string;
      background?: string;
      foreground?: string;
    }
  >
> = {
  still: {
    primary: "/projects/still/card.jpg",
    primaryMode: "visual",
    secondary: "/projects/still/mobile.jpg",
  },
  afterimage: {
    primary: "/projects/afterimage/card.jpg",
    primaryMode: "visual",
    secondary: "/projects/afterimage/mobile.jpg",
  },
  "ai-workflow": {
    primary: "/projects/ai-workflow/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/ai-workflow/card-secondary-v2.jpg",
  },
  "nexacro-react-poc": {
    primary: "/projects/nexacro-react-poc/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/nexacro-react-poc/card-secondary-v2.jpg",
  },
  "forensic-agent": {
    primary: "/projects/forensic-agent/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/forensic-agent/card-secondary-v2.jpg",
  },
  "api-data-transition": {
    primary: "/projects/api-data-transition/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/api-data-transition/card-secondary-v2.jpg",
  },
  "i18n-validation": {
    primary: "/projects/i18n-validation/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/i18n-validation/card-secondary-v2.jpg",
  },
  "typescript-migration": {
    primary: "/projects/typescript-migration/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/typescript-migration/card-secondary-v2.jpg",
  },
  kusting: {
    primary: "/projects/kusting/symbol.svg",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "#0066ff",
    secondary: "/projects/kusting/curation.png",
  },
  comma: {
    primary: "/projects/comma/brand-symbol.png",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "var(--foreground)",
    secondary: "/projects/comma/rest.png",
  },
  geobugirin: {
    primary: "/projects/geobugirin/symbol.svg",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "var(--foreground)",
    secondary: "/projects/geobugirin/onboarding.png",
  },
};

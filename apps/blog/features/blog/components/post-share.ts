import { trackPostEvent, type PostAnalyticsContext } from "./post-analytics-events";

type SharePostInput = {
  context: PostAnalyticsContext;
  mode?: "native" | "copy-link";
};

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

export async function sharePost({ context, mode }: SharePostInput) {
  const targetMode = mode ?? (typeof navigator.share === "function" ? "native" : "copy-link");

  if (targetMode === "native") {
    await (navigator as ShareCapableNavigator).share?.({
      title: context.title,
      text: context.title,
      url: context.url,
    });
    trackPostEvent(context, "share", "native");
    return "native";
  }

  await navigator.clipboard.writeText(context.url);
  trackPostEvent(context, "share", "copy-link");
  return "copy-link";
}

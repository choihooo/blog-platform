import { Button } from "@blog-platform/design-system";

type Props = {
  message?: string;
  onDiscard?: () => void;
  onRestore?: () => void;
  onRetry?: () => void;
};

export function RecoveryBanner({ message, onDiscard, onRestore, onRetry }: Props) {
  if (!message) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-4 py-3 text-sm">
      <span className="mr-auto">{message}</span>
      {onRestore ? (
        <Button onClick={onRestore} type="button" variant="secondary">
          Restore
        </Button>
      ) : null}
      {onRetry ? (
        <Button onClick={onRetry} type="button" variant="secondary">
          Retry
        </Button>
      ) : null}
      {onDiscard ? (
        <Button onClick={onDiscard} type="button" variant="ghost">
          Discard
        </Button>
      ) : null}
    </div>
  );
}

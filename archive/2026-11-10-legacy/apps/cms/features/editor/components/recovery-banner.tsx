import { Button } from "@hozui/react";

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
        <Button label="Restore" onClick={onRestore} type="button" variant="secondary" />
      ) : null}
      {onRetry ? (
        <Button label="Retry" onClick={onRetry} type="button" variant="secondary" />
      ) : null}
      {onDiscard ? (
        <Button label="Discard" onClick={onDiscard} type="button" variant="ghost" />
      ) : null}
    </div>
  );
}

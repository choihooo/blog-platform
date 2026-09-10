import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";

export default function ModalLoading() {
  return (
    <BlogArchiveModal>
      <div className="blog-archive-loading" role="status" aria-live="polite">
        <div className="blog-archive-loading__bar" />
        <div className="blog-archive-loading__body">
          <div className="blog-archive-loading__line blog-archive-loading__line--wide" />
          <div className="blog-archive-loading__line" />
          <p>불러오는 중...</p>
        </div>
      </div>
    </BlogArchiveModal>
  );
}

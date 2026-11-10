const previews = document.querySelectorAll(".preview-viewport");
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) entry.target.style.setProperty("--preview-scale", String(entry.contentRect.width / 1100));
});
previews.forEach((preview) => observer.observe(preview));

if (new URLSearchParams(location.search).has("preview")) {
  document.querySelector(".lab-toolbar")?.remove();
  document.querySelectorAll("a,button").forEach((element) => element.setAttribute("tabindex", "-1"));
}
document.querySelectorAll("[data-play]").forEach((button) => {
  button.addEventListener("click", () => {
    const played = button.closest("[data-easing]").classList.toggle("played");
    button.setAttribute("aria-pressed", String(played));
  });
});
document.querySelectorAll("[data-replay]").forEach((button) => {
  button.addEventListener("click", () => {
    const example = button.parentElement.querySelector("[data-stagger]");
    example.classList.remove("playing");
    requestAnimationFrame(() => requestAnimationFrame(() => example.classList.add("playing")));
  });
});
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    document.querySelectorAll("[data-category]").forEach((item) => { item.hidden = category !== "전체" && item.dataset.category !== category; });
    const empty = document.querySelector(".filter-empty");
    if (empty) empty.hidden = [...document.querySelectorAll("[data-category]")].some((item) => !item.hidden);
  });
});

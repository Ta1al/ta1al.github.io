const filters = [...document.querySelectorAll("[data-project-filter]")];
const projects = [...document.querySelectorAll("[data-project-discipline]")];
const status = document.querySelector(".filter-status");

if (filters.length && projects.length) {
  const activateFilter = (button) => {
    const selected = button.dataset.projectFilter;
    let visible = 0;
    filters.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    projects.forEach((project) => {
      const show =
        selected === "all" || project.dataset.projectDiscipline === selected;
      project.hidden = !show;
      project.classList.remove("is-last-visible");
      if (show) visible += 1;
    });
    if (visible % 2 === 1) {
      projects
        .filter((project) => !project.hidden)
        .at(-1)
        ?.classList.add("is-last-visible");
    }
    if (status) {
      status.textContent = `${visible} project${visible === 1 ? "" : "s"} shown.`;
    }
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => activateFilter(filter));
  });
  activateFilter(
    filters.find((filter) => filter.getAttribute("aria-pressed") === "true") ??
      filters[0],
  );
}

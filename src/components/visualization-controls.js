const visualizationIcons = {
  "over-time": "/images/bar-chart.svg",
  "heat-map": "/images/fire.svg",
  "days": "/images/line-chart.svg",
  "authorShare": "/images/bar-chart.svg",
  "author_bubble": "/images/bubble.svg",
  "nola-genre-bubble": "/images/bubble.svg",
  "calendar": "/images/calendar.svg"
};
function visualizationIcon(id) {
  const icon = document.createElement("img");
  icon.src = visualizationIcons[id];
  icon.alt = "";
  icon.className = "visualization-icon";
  return icon;
}

const visualizationGroups = [
  {
    label: "Annual Performance Comparison",
    options: [
      ["over-time", "Number of Performances"],
      ["heat-map", "Heat Map"],
      ["days", "Days with Performances"]
    ]
  },
  {
    label: "Authors",
    options: [
      ["authorShare", "Author Share"],
      ["author_bubble", "Author Bubble"]
    ]
  },
  {
    label: "Genres",
    options: [["nola-genre-bubble", "NOLA Genre Bubble"]]
  },
  {
    label: "Performance Calendar",
    options: [["calendar", "Calendar"]]
  }
];


export function createVisualizationInput(Inputs, vizParam, vizLabelById) {
  const selectedVizIds = vizParam
    ? vizParam.split(",").filter(id => vizLabelById[id])
    : ["over-time"];
  if (selectedVizIds.length === 0) selectedVizIds.push("over-time");

  const visualizationLabels = visualizationGroups.flatMap(group => group.options.map(([, label]) => label));
  const selectedLabels = visualizationGroups.flatMap(group => group.options
    .filter(([, label]) => selectedVizIds.some(id => vizLabelById[id] === label))
    .map(([, label]) => label));
  const vizInput = Inputs.checkbox(visualizationLabels, {
    label: null,
    value: selectedLabels
  });
  vizInput.style.cssText = "width:100%; min-width:0; font-family:Arial, sans-serif;";
  const vizOptionList = vizInput.querySelector("div");
  const vizOptionLabels = new Map(
    [...vizOptionList.querySelectorAll("label")].map(option => [option.textContent.trim(), option])
  );
  vizOptionList.style.cssText = "display:grid; gap:.3rem; min-width:0;";
  for (const group of visualizationGroups) {
    const section = document.createElement("details");
    section.open = group.options.some(([, label]) => selectedLabels.includes(label));
    section.className = "visualization-group";
    const heading = document.createElement("summary");
    heading.textContent = group.label;
    heading.className = "controls-section-title";
    heading.style.cssText = "margin:0; cursor:pointer;";
    section.append(heading);
    const options = document.createElement("div");
    options.className = "visualization-options";
    for (const [id, label] of group.options) {
      const option = vizOptionLabels.get(label);
      option.className = "visualization-option";
      option.querySelector("input").after(visualizationIcon(id));
      options.append(option);
    }
    section.append(options);
    vizOptionList.append(section);
  }
  const updateEmptySelection = () => vizInput.toggleAttribute("data-empty-selection", vizInput.value.length === 0);
  vizInput.addEventListener("input", updateEmptySelection);
  updateEmptySelection();
  return vizInput;
}

export function setupControlsPanel() {
  const controlsWorkspace = document.querySelector(".controls-workspace");
  // Keep the fixed settings panel outside the chart layout.
  const originalPosition = document.createComment("visualization controls");
  controlsWorkspace.before(originalPosition);
  document.body.append(controlsWorkspace);
  const panelButtons = [...controlsWorkspace.querySelectorAll("[data-panel-button]")];
  function setControlsPanel(panel) {
    controlsWorkspace.dataset.panel = panel;
    for (const button of panelButtons) {
      button.setAttribute("aria-expanded", String(button.dataset.panelButton === panel));
    }
    controlsWorkspace.querySelector("#controls-panel-title").textContent = panel === "filters" ? "Filters" : "Visualizations";
  }
  const panelEvents = new AbortController();
  for (const button of panelButtons) {
    button.addEventListener("click", () => {
      setControlsPanel(controlsWorkspace.dataset.panel === button.dataset.panelButton ? "none" : button.dataset.panelButton);
    }, { signal: panelEvents.signal });
  }
  controlsWorkspace.querySelector("[data-close-panel]").addEventListener("click", () => {
    const activeButton = panelButtons.find(button => button.getAttribute("aria-expanded") === "true");
    setControlsPanel("none");
    activeButton?.focus();
  }, { signal: panelEvents.signal });
  controlsWorkspace.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      panelButtons.find(button => button.getAttribute("aria-expanded") === "true")?.focus();
      setControlsPanel("none");
    }
  }, { signal: panelEvents.signal });
  return () => {
    panelEvents.abort();
    originalPosition.replaceWith(controlsWorkspace);
  };
}

export function observeChartWidth(notify) {
  const main = document.querySelector("#observablehq-main");
  let previousWidth;
  const measure = () => {
    const style = getComputedStyle(main);
    const width = Math.max(1, Math.floor(main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
    if (width !== previousWidth) {
      previousWidth = width;
      notify(width);
    }
  };
  const observer = new ResizeObserver(measure);
  observer.observe(main);
  measure();
  return () => observer.disconnect();
}

export function notifyEmbedReady() {
  // Reveal the embed only once the initial Observable cells have settled.
  // Observing child nodes catches async chart outputs without tracking animation frames.
  const embedMain = document.querySelector("#observablehq-main");
  let previousHeight;
  function reportHeight() {
    if (embedMain.querySelector("observablehq-loading")) return;
    const height = Math.max(1, Math.ceil(embedMain.getBoundingClientRect().height));
    if (height !== previousHeight) {
      previousHeight = height;
      window.parent.postMessage({ type: "observable-height", height }, "*");
    }
  }
  const heightObserver = new ResizeObserver(reportHeight);
  heightObserver.observe(embedMain);
  let embedReadyTimer;
  let embedReadySent = false;
  function checkEmbedReady() {
    clearTimeout(embedReadyTimer);
    if (embedReadySent || document.readyState !== "complete" || embedMain.querySelector("observablehq-loading")) return;
    embedReadyTimer = setTimeout(() => {
      reportHeight();
      embedReadySent = true;
      window.parent.postMessage({ type: "observable-ready" }, "*");
      embedReadyObserver.disconnect();
    }, 200);
  }
  const embedReadyObserver = new MutationObserver(checkEmbedReady);
  embedReadyObserver.observe(embedMain, { childList: true, subtree: true });
  window.addEventListener("load", checkEmbedReady);
  checkEmbedReady();
  return () => {
    clearTimeout(embedReadyTimer);
    heightObserver.disconnect();
    embedReadyObserver.disconnect();
    window.removeEventListener("load", checkEmbedReady);
  };
}

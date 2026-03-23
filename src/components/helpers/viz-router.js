// Encapsulate the viz checkbox + query param override logic.

export function createVizToggle({ Inputs, view }, opts) {
  const vizLabelById = opts?.vizLabelById ?? {
    "over-time": "Over Time",
    "genres": "Diverging Genres",
    "authors": "By Author",
    "days": "Days with Performances",
    "authorShare": "Author Share",
    "author-shares": "Author Share",
    "author_bubble": "Author Bubble",
    "author-bubble": "Author Bubble",
    "authorBubble": "Author Bubble",
    "calendar": "Calendar"
  };

  const labels = opts?.labels ?? [
    "Over Time",
    "Diverging Genres",
    "By Author",
    "Days with Performances",
    "Author Share",
    "Author Bubble",
    "Calendar"
  ];

  let vizParam = null;
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    vizParam = params.get("viz");
  }

  if (vizParam && vizLabelById[vizParam]) {
    return [vizLabelById[vizParam]];
  }

  const vizOpt = Inputs.checkbox(labels, {
    label: "Visualization",
    value: ["Over Time"]
  });

  return view(vizOpt);
}

export function vizFlags(viz) {

  const selected = Array.isArray(viz) ? viz : [];
  return {
    overTime: selected.includes("Over Time"),
    divergingGenres: selected.includes("Diverging Genres"),
    byAuthor: selected.includes("By Author"),
    performanceDays: selected.includes("Days with Performances"),
    authorShare: selected.includes("Author Share"),
    bubble: selected.includes("Author Bubble"),
    calendar: selected.includes("Calendar")
  };
}


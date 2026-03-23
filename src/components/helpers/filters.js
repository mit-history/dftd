// Reusable UI controls (Inputs.*) extracted from index.md

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function wireSelectAllToggle({ listInput, toggleInput, allValues }) {
  // Toggle → list
  toggleInput.oninput = (event) => {
    if (event && event.bubbles === false) return;
    listInput.value = toggleInput.value ? allValues : [];
    listInput.dispatchEvent(new Event("input"));
  };

  // List → toggle
  listInput.oninput = () => {
    toggleInput.value = ensureArray(listInput.value).length === allValues.length;
  };
}

export function createDateFilters({ Inputs, view }, defaults = { start: "1748-01-01", end: "1798-12-31" }) {
  const start_date_input = Inputs.date({ label: "Start", value: defaults.start });
  const end_date_input = Inputs.date({ label: "End", value: defaults.end });

  const start_date = view(start_date_input);
  const end_date = view(end_date_input);

  const randomizeDates = () => {
    const start = new Date(defaults.start);
    const end = new Date(defaults.end);
    const new_start = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const new_end = new Date(new_start.getTime() + Math.random() * (end.getTime() - new_start.getTime()));
    start_date_input.value = new_start;
    end_date_input.value = new_end;
    start_date_input.dispatchEvent(new Event("input"));
    end_date_input.dispatchEvent(new Event("input"));
  };

  return { start_date_input, end_date_input, start_date, end_date, randomizeDates };
}

export function createOriginFilters({ Inputs, view }, originOptions = ["danish", "dutch", "french"]) {
  const originsInput = Inputs.checkbox(originOptions, { label: "Origin", value: originOptions });
  const originsSelect = Inputs.toggle({ label: "Select All", value: true });

  const origins = view(originsInput);
  view(originsSelect);

  wireSelectAllToggle({ listInput: originsInput, toggleInput: originsSelect, allValues: originOptions });

  const randomizeOrigins = () => {
    const newValue = originOptions.filter(() => Math.round(Math.random()));
    originsInput.value = newValue;
    originsInput.dispatchEvent(new Event("input"));
    originsSelect.value = newValue.length === originOptions.length;
  };

  return { originOptions, originsInput, originsSelect, origins, randomizeOrigins };
}

export function createGenreFilters({ Inputs, view }, { formatted_data, origins }) {
  const genreOptions = Array.from(
    new Set(
      formatted_data
        .filter(d => origins.includes(d.origin))
        .map(d => d.genre)
        .filter(Boolean)
    )
  ).sort();

  const genreInput = Inputs.checkbox(genreOptions, {
    label: "Select genre(s)",
    value: genreOptions
  });

  const genreSelect = Inputs.toggle({ label: "Select All", value: true });

  if (genreOptions.length > 0) view(genreSelect);

  wireSelectAllToggle({ listInput: genreInput, toggleInput: genreSelect, allValues: genreOptions });

  const genres = view(genreInput);

  return { genreOptions, genreInput, genreSelect, genres };
}

export function createAuthorFilters({ Inputs, view }, { french, danish, dutch }) {
  const authorOptions = [
    "No author",
    ...Array.from(
      new Set([
        ...french.map(d => (d.author || "").split(" ; ")).flat().filter(Boolean),
        ...danish.map(d => (d.author || "").split(" ; ")).flat().filter(Boolean),
        ...dutch.map(d => d.author).filter(Boolean)
      ])
    ).sort()
  ];

  const authorInput = Inputs.select(authorOptions, { label: "Filter by author", value: "No author" });
  const author = view(authorInput);

  const randomizeAuthor = () => {
    authorInput.value = authorOptions[Math.floor(Math.random() * authorOptions.length)];
    authorInput.dispatchEvent(new Event("input"));
  };

  return { authorOptions, authorInput, author, randomizeAuthor };
}

export function createRandomizeButton({ Inputs }, { randomizeDates, randomizeOrigins, randomizeAuthor }) {
  return Inputs.button("Randomize", {
    value: null,
    reduce: () => {
      randomizeDates?.();
      randomizeOrigins?.();
      randomizeAuthor?.();
      return null;
    }
  });
}

export const DEFAULT_CATEGORIES = [
  "antique",
  "audio",
  "video",
  "camera",
];

export function normalizeCategory(value = "") {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getCategories(enquiries = []) {
  return [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...enquiries
        .map((item) => normalizeCategory(item.category || ""))
        .filter(Boolean),
    ]),
  ];
}

export function getSubcategories(enquiries = [], category = "") {
  return [
    ...new Set(
      enquiries
        .filter(
          (item) =>
            !category ||
            normalizeCategory(item.category || "") ===
              normalizeCategory(category)
        )
        .map((item) => normalizeCategory(item.subcategory || ""))
        .filter(Boolean)
    ),
  ].sort();
}

export function formatCategory(value = "") {
  return value
    .split(" ")
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
    )
    .join(" ");
}
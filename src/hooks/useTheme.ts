export type Theme = "dark";

export function applyTheme(_theme: Theme = "dark") {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#071711");
  }
}

export function useTheme() {
  return {
    theme: "dark" as const,
    toggleTheme: () => {},
  };
}

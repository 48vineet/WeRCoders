export const getDifficultyBadgeClass = (difficulty) => {
  const value =
    typeof difficulty === "string" ? difficulty.toLowerCase() : "default";
  switch (value) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

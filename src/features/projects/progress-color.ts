export function progressIndicatorClass(progress: number) {
  if (progress < 40) return "bg-danger";
  if (progress < 70) return "bg-warning";
  return "bg-success";
}

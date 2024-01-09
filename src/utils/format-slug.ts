import { format } from "date-fns";

export function formatSlug(date: Date, slug: string): string {
  return `/${format(date, "yyyy/MM/dd")}/${slug}`;
}

import { format } from "date-fns";

export function formatPostSlugPath(date: Date, slug: string): string {
  return `/${format(date, "yyyy/MM/dd")}/${slug}`;
}

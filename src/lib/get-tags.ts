import _ from "lodash-es";
import type { CollectionEntry } from "astro:content";

type post = CollectionEntry<"posts">;

export function getTags(posts: post[]): string[] {
  return _.chain(posts).map("data.tags").flatten().sort().uniq().value();
}

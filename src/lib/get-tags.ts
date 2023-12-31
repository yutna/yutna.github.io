import { getCollection } from "astro:content";
import _ from "lodash-es";

export async function getTags(): Promise<string[]> {
  const posts = await getCollection("posts");
  return _.chain(posts).map("data.tags").flatten().sort().uniq().value();
}

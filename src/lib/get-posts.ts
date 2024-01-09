import { getCollection } from "astro:content";
import _ from "lodash-es";

import type { CollectionEntry } from "astro:content";

export async function getPosts() {
  const posts = await getCollection("posts");

  return _.chain(posts)
    .filter(publishedContent)
    .sortBy(publishedDate)
    .reverse()
    .value();
}

// Internal functions

function publishedContent(post: CollectionEntry<"posts">) {
  return import.meta.env.PROD ? !post.data.draft : true;
}

function publishedDate(post: CollectionEntry<"posts">) {
  return post.data.publishedDate.getTime();
}

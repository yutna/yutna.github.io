import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.date(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  posts,
};

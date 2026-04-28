import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schéma commun aux articles et piliers
const articleSchema = z.object({
  title: z.string().max(70),
  metaTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  slug: z.string(),
  excerpt: z.string().max(200),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string(), // slug de l'auteur
  category: z.enum(['economies', 'carburants', 'fiscalite', 'entretien']),
  tags: z.array(z.string()),
  featuredImage: z.string(),
  imageAlt: z.string(),
  readingTime: z.number(),
  pillar: z.string().optional(), // slug du pilier parent
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  draft: z.boolean().default(false),
});

// Articles satellites
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: articleSchema,
});

// Articles piliers de silo
const piliers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/piliers' }),
  schema: articleSchema.extend({
    relatedArticles: z.array(z.string()).default([]), // slugs des satellites
    ctaTitle: z.string().optional(),
    ctaDescription: z.string().optional(),
  }),
});

// Auteurs
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    bio: z.string(),
    photo: z.string(),
    expertise: z.array(z.string()),
    email: z.string().email().optional(),
    linkedin: z.string().optional(),
  }),
});

export const collections = { blog, piliers, authors };

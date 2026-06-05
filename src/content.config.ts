import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().max(200),
    pillar: z.number().int().min(1).max(5),
    tags: z.array(z.string()).default([]),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).default([]),
    }).optional(),
  }),
});

const investigacion = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/investigacion' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number().int(),
    status: z.enum(['published', 'in-press']),
    type: z.enum(['thesis', 'paper']),
    abstract: z.string(),
    pdfUrl: z.string().optional(),
    link: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    role: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    featured: z.boolean().default(false),
    order: z.number().int().default(99),
    caseStudy: z.boolean().default(false),
  }),
});

export const collections = { blog, investigacion, projects };

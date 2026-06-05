import rss from '@astrojs/rss';
import { reader } from '@/lib/keystatic';
import { SITE } from '@/data/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const entries = await reader.collections.news.all();
  const items = entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      date: entry.date,
      excerpt: entry.excerpt,
      body: entry.body,
    }))
    .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));

  return rss({
    title: `${SITE.name} – Aktuelles`,
    description: 'Neuigkeiten von Travel2Rescue e.V. aus Lombok.',
    site: context.site ?? SITE.url,
    items: items.map((p) => ({
      title: p.title,
      pubDate: p.date ? new Date(p.date) : new Date(),
      description: p.excerpt ?? '',
      content: p.body ?? '',
      link: `/aktuelles/${p.slug}/`,
    })),
    customData: '<language>de-DE</language>',
  });
}

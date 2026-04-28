// Flux RSS — généré automatiquement depuis la collection blog
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'Mon Carburant',
    description: 'Économisez sur le carburant, roulez plus malin. Conseils, comparatifs et décryptages pour les automobilistes français.',
    site: context.site!,
    items: articles
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((article) => ({
        title: article.data.title,
        pubDate: article.data.publishedAt,
        description: article.data.excerpt,
        link: `/blog/${article.data.slug}/`,
        categories: [article.data.category, ...article.data.tags],
        author: `contact@mon-carburant.com (${article.data.author})`,
      })),
    customData: `<language>fr-FR</language><copyright>© ${new Date().getFullYear()} Mon Carburant</copyright>`,
    stylesheet: false,
  });
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://plattform.mx';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Opcional: rutas que no queremos indexar
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

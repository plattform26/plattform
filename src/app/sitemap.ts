import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://plattform.com';

  // Rutas estáticas de alto nivel
  const staticRoutes = [
    '',
    '/creators',
    '/login',
    '/register',
    '/courses',
    '/terms',
    '/privacy',
    '/refunds',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Rutas dinámicas: Cursos
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    select: { slug: true, updatedAt: true },
  });

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes];
}

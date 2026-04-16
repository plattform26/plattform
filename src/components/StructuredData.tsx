'use client';

export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Plattform",
    "url": "https://plattform.com",
    "logo": "https://plattform.com/logo.png",
    "description": "Infraestructura SaaS de élite para el aprendizaje de alto rendimiento impulsado por IA.",
    "sameAs": [
      "https://twitter.com/plattform",
      "https://linkedin.com/company/plattform"
    ],
    "offers": {
      "@type": "Offer",
      "description": "SaaS para creación y venta de cursos profesionales."
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

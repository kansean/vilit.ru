import { company } from '../data/company';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

export function getFullTitle(title: string): string {
  if (title === company.name) return `${company.name} — Автоматизация розничной торговли`;
  return `${title} — ${company.name}`;
}

export function getCanonicalURL(path: string): string {
  const base = company.site.endsWith('/') ? company.site.slice(0, -1) : company.site;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

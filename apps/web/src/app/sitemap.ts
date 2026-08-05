import { MetadataRoute } from 'next';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://piksmedia.com';

  // Base routes
  const routes = [
    '',
    '/shop',
    '/story',
    '/contact',
    '/cart',
    '/privacy-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic products for sitemap
  try {
    const res = await axios.get(`${API_BASE_URL}/catalog/products`);
    const products = res.data?.data || [];
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/shop/${product._id}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap product fetch error:', error);
    return routes;
  }
}

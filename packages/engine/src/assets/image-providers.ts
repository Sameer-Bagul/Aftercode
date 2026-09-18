import { ImageAssetResult } from '@aftercode/shared';

/**
 * ImageProviders Service
 * Searches and retrieves icons and open-source images for Aftercode video production.
 */
export class ImageProviders {
  /**
   * Search tech stack icons via Iconify REST API
   * Searches sets like devicon, logos, simple-icons
   */
  static async searchIconify(query: string, limit: number = 12): Promise<ImageAssetResult[]> {
    try {
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data: any = await response.json();
      if (!data || !Array.isArray(data.icons)) return [];

      return data.icons.map((iconName: string, index: number) => {
        const [prefix, name] = iconName.split(':');
        const svgUrl = `https://api.iconify.design/${prefix}/${name}.svg`;
        return {
          id: `iconify_${iconName}_${index}`,
          title: `${name} (${prefix})`,
          url: svgUrl,
          thumbnailUrl: svgUrl,
          source: 'iconify',
          license: 'Open Source / MIT / Apache',
        };
      });
    } catch (error) {
      console.warn(`Iconify API search warning for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Search Wikimedia Commons for open-source reference images
   */
  static async searchWikimedia(query: string, limit: number = 10): Promise<ImageAssetResult[]> {
    try {
      const baseUrl = 'https://commons.wikimedia.org/w/api.php';
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: `File:${query}`,
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|size',
        gsrlimit: limit.toString(),
        origin: '*',
      });

      const response = await fetch(`${baseUrl}?${params.toString()}`);
      if (!response.ok) return [];

      const data: any = await response.json();
      const pages = data?.query?.pages;
      if (!pages) return [];

      return Object.values(pages)
        .filter((page: any) => page.imageinfo && page.imageinfo[0]?.url)
        .map((page: any, index: number) => {
          const info = page.imageinfo[0];
          const ext = info.extmetadata || {};
          const license = ext.LicenseShortName?.value || ext.License?.value || 'CC BY-SA';
          return {
            id: `wiki_${page.pageid || index}`,
            title: page.title.replace(/^File:/i, ''),
            url: info.url,
            thumbnailUrl: info.thumburl || info.url,
            source: 'wikimedia',
            license,
            width: info.width,
            height: info.height,
          };
        });
    } catch (error) {
      console.warn(`Wikimedia Commons search warning for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Search Openverse for CC-licensed photography and media
   */
  static async searchOpenverse(query: string, limit: number = 10): Promise<ImageAssetResult[]> {
    try {
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data: any = await response.json();
      if (!data || !Array.isArray(data.results)) return [];

      return data.results.map((item: any, index: number) => ({
        id: `openverse_${item.id || index}`,
        title: item.title || query,
        url: item.url,
        thumbnailUrl: item.thumbnail || item.url,
        source: 'openverse',
        license: item.license || 'CC0',
        width: item.width,
        height: item.height,
      }));
    } catch (error) {
      console.warn(`Openverse API search warning for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Universal search combining Iconify tech icons, Wikimedia images, and Openverse
   */
  static async searchAll(query: string): Promise<ImageAssetResult[]> {
    const [icons, wikiImages, openverseImages] = await Promise.all([
      this.searchIconify(query, 8),
      this.searchWikimedia(query, 6),
      this.searchOpenverse(query, 6),
    ]);

    return [...icons, ...wikiImages, ...openverseImages];
  }
}

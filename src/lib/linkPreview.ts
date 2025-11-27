export interface LinkPreview {
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    // Use a CORS proxy to fetch Open Graph data
    // For production, you'd want to use your own backend or a service like LinkPreview API
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) return null;
    
    // Parse HTML to extract Open Graph tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const getMetaContent = (property: string): string | undefined => {
      const meta = doc.querySelector(`meta[property="${property}"]`) || 
                   doc.querySelector(`meta[name="${property}"]`);
      return meta?.getAttribute('content') || undefined;
    };
    
    const title = getMetaContent('og:title') || 
                  doc.querySelector('title')?.textContent || 
                  '';
    
    const description = getMetaContent('og:description') || 
                       getMetaContent('description') || 
                       undefined;
    
    const image = getMetaContent('og:image') || undefined;
    const siteName = getMetaContent('og:site_name') || undefined;
    
    return {
      title: title.trim(),
      description,
      image,
      siteName,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
}


export interface LinkPreview {
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
}

/** Fetch via XMLHttpRequest to avoid Telegram WebView's "Open Link" interception. */
function xhrGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = 8000;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
      else reject(new Error(`HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Timeout"));
    xhr.send();
  });
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const raw = await xhrGet(proxyUrl);
    const data = JSON.parse(raw) as { contents?: string };
    
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


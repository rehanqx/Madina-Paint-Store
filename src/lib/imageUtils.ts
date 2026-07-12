export const getImagePlaceholder = (width: number = 400, height: number = 300) => {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3Crect fill="%23e5e7eb" width="${width}" height="${height}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E`;
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getImageAltText = (title: string, index?: number): string => {
  return index !== undefined ? `${title} - Image ${index + 1}` : title;
};

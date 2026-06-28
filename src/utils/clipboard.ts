/**
 * A robust utility to copy text to the clipboard.
 * Attempts to use the modern `navigator.clipboard.writeText` API first.
 * If that fails or is unavailable (e.g., non-HTTPS, unsupported browser),
 * it falls back to a hidden textarea and `document.execCommand('copy')`.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Modern clipboard API failed, falling back...', err);
    }
  }

  // 2. Fallback using execCommand
  return new Promise((resolve) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      resolve(successful);
    } catch (err) {
      console.error('Fallback clipboard failed', err);
      resolve(false);
    }
  });
}

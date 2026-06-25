/// <reference types="astro/client" />

interface Window {
  saveToDashboard: (title: string, path: string, payload: { type: string, data: any }) => boolean;
}

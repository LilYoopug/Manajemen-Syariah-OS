import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Simple markdown to HTML converter for AI-generated content.
 * Handles: bold, italic, numbered lists, bullet lists, line breaks.
 */
export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_ (but not if it's part of ** or __)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

  // Numbered lists: 1. text, 2. text, etc.
  // Convert consecutive numbered items to <ol><li>...</li></ol>
  const lines = html.split('\n');
  const result: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);

    if (orderedMatch) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          result.push('</ul>');
          inUnorderedList = false;
        }
        result.push('<ol class="list-decimal list-inside space-y-1 my-2">');
        inOrderedList = true;
      }
      result.push(`<li>${orderedMatch[2]}</li>`);
    } else if (unorderedMatch) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          result.push('</ol>');
          inOrderedList = false;
        }
        result.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inUnorderedList = true;
      }
      result.push(`<li>${unorderedMatch[1]}</li>`);
    } else {
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (line) {
        result.push(`<p class="mb-2">${line}</p>`);
      }
    }
  }

  // Close any open lists
  if (inOrderedList) result.push('</ol>');
  if (inUnorderedList) result.push('</ul>');

  return result.join('\n');
}

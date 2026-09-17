import { renderProfile } from './profile.js';
import { renderNote } from './note.js';
import { renderArticle } from './article.js';
import { renderCalendarEvent } from './calendar.js';
import { renderMedia } from './media.js';
import { renderFallback } from './fallback.js';
import type { RenderContext } from '../types.js';

/**
 * Dispatches the event to the appropriate renderer based on its kind.
 */
export function renderEvent(ctx: RenderContext): string {
  const { event } = ctx;

  switch (event.kind) {
    case 0:
      return renderProfile(ctx);

    case 1:
      return renderNote(ctx);

    case 20: // NIP-68 Picture
    case 21: // NIP-71 Horizontal Video
    case 22: // NIP-71 Vertical Short Video
    case 1063: // File Metadata
    case 34235: // NIP-71 Horizontal Video
    case 34236: // NIP-71 Vertical Video
      return renderMedia(ctx);

    case 30023: // NIP-23 Long-form Article
      return renderArticle(ctx);

    case 31922: // NIP-52 Date-Based Calendar Event
    case 31923: // NIP-52 Time-Based Calendar Event
      return renderCalendarEvent(ctx);

    default:
      return renderFallback(ctx);
  }
}

export {
  renderProfile,
  renderNote,
  renderArticle,
  renderCalendarEvent,
  renderMedia,
  renderFallback
};

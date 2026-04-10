// ============================================================
// STRIP HTML FROM GOOGLE CALENDAR EVENTS
// ============================================================
// Fixes the Google Calendar → Apple Calendar HTML rendering issue.
// Google Calendar silently stores event descriptions as HTML.
// Apple Calendar displays the raw HTML tags instead of rendering them.
// This script converts all HTML descriptions to clean plain text.
//
// SETUP:
// 1. Go to https://script.google.com
// 2. Click "New project"
// 3. Delete the placeholder code and paste this entire file
// 4. Click the disk icon (Save) and name the project "Calendar HTML Stripper"
// 5. Run "stripAllExistingEvents" once to clean up past events
// 6. Set up the auto-trigger by running "createDailyTrigger" once
//
// HOW IT WORKS:
// - Runs automatically once per day
// - Scans events in the next 60 days
// - Converts any HTML descriptions to clean plain text
// - Preserves URLs as raw links (clickable in Apple Calendar)
// - Logs every change so you can audit in View > Executions
// ============================================================

/**
 * Main function: strip HTML from upcoming calendar events.
 * Processes next 60 days by default.
 */
function stripHtmlFromUpcomingEvents() {
  var calendarId = 'primary'; // uses whatever Google account runs this script
  var now = new Date();
  var future = new Date();
  future.setDate(future.getDate() + 60);

  var events = CalendarApp.getDefaultCalendar().getEvents(now, future);
  var cleaned = 0;

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var desc = event.getDescription();

    if (desc && hasHtml(desc)) {
      var plainText = htmlToPlainText(desc);
      event.setDescription(plainText);
      cleaned++;
      Logger.log('Cleaned: ' + event.getTitle() + ' (' + event.getStartTime() + ')');
    }
  }

  Logger.log('Done. Cleaned ' + cleaned + ' events out of ' + events.length + ' total.');
}

/**
 * One-time cleanup: strip HTML from past and future events.
 * Processes 6 months back and 6 months forward.
 * Run this once during setup, then the daily trigger handles the rest.
 */
function stripAllExistingEvents() {
  var past = new Date();
  past.setMonth(past.getMonth() - 6);
  var future = new Date();
  future.setMonth(future.getMonth() + 6);

  var events = CalendarApp.getDefaultCalendar().getEvents(past, future);
  var cleaned = 0;

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var desc = event.getDescription();

    if (desc && hasHtml(desc)) {
      var plainText = htmlToPlainText(desc);
      event.setDescription(plainText);
      cleaned++;
      Logger.log('Cleaned: ' + event.getTitle() + ' (' + event.getStartTime() + ')');
    }
  }

  Logger.log('Bulk cleanup done. Cleaned ' + cleaned + ' events out of ' + events.length + ' total.');
}

/**
 * Set up an automatic daily trigger.
 * Run this function once — it creates a time-based trigger
 * that runs stripHtmlFromUpcomingEvents every day at 5 AM.
 */
function createDailyTrigger() {
  // Remove any existing triggers for this function first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'stripHtmlFromUpcomingEvents') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('stripHtmlFromUpcomingEvents')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .create();

  Logger.log('Daily trigger created. Will run stripHtmlFromUpcomingEvents every day at 5 AM.');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if a string contains HTML tags.
 */
function hasHtml(text) {
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Convert HTML to clean plain text.
 * - Extracts href URLs from anchor tags and preserves them
 * - Converts <br>, <p>, <div>, <li> to line breaks
 * - Strips all remaining HTML tags
 * - Cleans up excessive whitespace
 * - Decodes HTML entities
 */
function htmlToPlainText(html) {
  var text = html;

  // Extract URLs from anchor tags: <a href="URL">text</a> → text: URL
  // If link text equals URL, just keep the URL once
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, function(match, url, linkText) {
    linkText = linkText.replace(/<[^>]+>/g, '').trim();
    if (linkText === url || linkText === '') {
      return url;
    }
    return linkText + ': ' + url;
  });

  // Convert block-level elements to line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '- ');
  text = text.replace(/<\/ul>/gi, '\n');
  text = text.replace(/<ul[^>]*>/gi, '');
  text = text.replace(/<\/ol>/gi, '\n');
  text = text.replace(/<ol[^>]*>/gi, '');
  text = text.replace(/<hr[^>]*>/gi, '\n---\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<h[1-6][^>]*>/gi, '');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/td>/gi, '  ');
  text = text.replace(/<\/th>/gi, '  ');

  // Strip bold/italic markers (keep text inside)
  text = text.replace(/<\/?(?:b|strong|i|em|u|span|font)[^>]*>/gi, '');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&hellip;/g, '...');
  text = text.replace(/&#\d+;/g, ''); // catch remaining numeric entities

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' ');         // collapse horizontal whitespace
  text = text.replace(/ *\n */g, '\n');         // trim spaces around line breaks
  text = text.replace(/\n{3,}/g, '\n\n');       // max 2 consecutive line breaks
  text = text.trim();

  return text;
}

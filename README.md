# Calendar HTML Stripper

**Fix the raw HTML that shows up in Apple Calendar when syncing from Google Calendar.**

If your Apple Calendar event notes look like this:
<p>REVIEW: HireFlix Candidate Videos<br><br>OBJECTIVE:<br>Evaluate submitted
HireFlix videos for candidate screening<br><br>ACTION:<br>Review candidate
videos<br>Flag candidates for next step or rejection<br>Add brief notes if
needed<br><br><br>LINK:<br><a href="https://admin.hireflix.com/en/jobs/...
```
Instead of this:
REVIEW: HireFlix Candidate Videos

OBJECTIVE:
Evaluate submitted HireFlix videos for candidate screening

ACTION:
Review candidate videos
Flag candidates for next step or rejection
Add brief notes if needed

LINK:
https://admin.hireflix.com/en/jobs/...
This script fixes it. Automatically. Forever.
Why This Happens
Google Calendar's editor silently converts event descriptions to HTML — even when you type or paste plain text. Google Calendar renders the HTML just fine, so you never notice. But Apple Calendar receives the raw HTML over CalDAV sync and displays it as literal text. Tags, entities, and all.
This isn't a bug you can toggle off. It's a fundamental mismatch between how Google stores descriptions and how Apple reads them.
What This Script Does
A Google Apps Script that runs on your Google account and:

Scans your upcoming calendar events daily
Detects HTML in event descriptions
Converts them to clean plain text
Preserves all URLs as raw links (still clickable in Apple Calendar)
Converts HTML lists to clean dash bullets
Decodes HTML entities (&amp; → &, &nbsp; → space, etc.)
Runs silently in the background — no workflow changes needed

Setup (5 minutes, one time)
1. Open Google Apps Script
Go to script.google.com and sign in with the Google account that owns (or has edit access to) the calendar.
2. Create the project

Click New project
Click "Untitled project" at the top and rename it to Calendar HTML Stripper
Delete the placeholder code in the editor
Copy the entire contents of Code.gs and paste it in
Press Cmd+S (Mac) or Ctrl+S (Windows) to save

3. Clean up existing events

In the function dropdown (near the top toolbar), select stripAllExistingEvents
Click the ▶ Run button
Google will ask you to authorize the script — click through the permissions (it needs access to your calendar)
Wait for it to finish (check the Execution log at the bottom)

This does a one-time sweep of 6 months back and 6 months forward.
4. Set up the daily auto-run

Switch the function dropdown to createDailyTrigger
Click ▶ Run

Done. The script now runs every day at 5 AM and cleans any new events with HTML descriptions. You never need to touch it again.
FAQ
Will this break my Google Calendar events?
No. It only modifies the description text — converting HTML to the plain text equivalent. The content stays the same, it just renders correctly in Apple Calendar.
Does this work for shared/team calendars?
By default it processes your primary calendar. You can modify the script to target other calendars — see the comments in Code.gs.
What about events created by third-party apps (Calendly, HubSpot, Hireflix, etc.)?
That's exactly what this fixes. Those apps typically write HTML via the Google Calendar API. This script cleans it up after they create the event.
Does my EA/assistant need to change anything?
No. That's the whole point. Whoever creates events keeps doing exactly what they're doing. The script runs in the background and fixes descriptions before Apple Calendar syncs them.
Can I run it more frequently than once a day?
Yes. In the createDailyTrigger function, you can change .everyDays(1) to .everyHours(1) for hourly runs. Be aware of Apps Script quotas if you have a very full calendar.
How do I stop it?
Go to script.google.com, open the project, click the clock icon (Triggers) in the left sidebar, and delete the trigger.
How It Works (Technical)
The htmlToPlainText function:

Extracts URLs from <a> tags and preserves them as raw links
Converts block elements (<br>, <p>, <div>, <li>) to line breaks
Converts <li> elements to -  prefixed lines
Strips all remaining HTML tags
Decodes HTML entities (amp, nbsp, smart quotes, etc.)
Collapses excessive whitespace and blank lines

License
MIT — use it, fork it, share it.
Credits
Built by Sarah Evans because every calendar app should just work.

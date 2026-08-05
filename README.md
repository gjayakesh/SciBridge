# SciBridge — Multi-Page Site

Same tech stack as before — plain HTML, CSS, and JavaScript, no build step,
no backend server. This version is split into real, separate pages instead
of one single-file app, and everything talks to the same storage layer
(`window.storage`, the Claude.ai artifact persistence API) so it keeps
working the same way it did as a single file.

## Structure

```
index.html                 Home
about.html
explore.html
login.html
signup.html
dashboard.html
doubts.html
build-choice.html
individual-workspace.html
team-setup.html
team-workspace.html
project-detail.html
mentor-apply.html
profile.html
admin-login.html
admin.html

css/style.css               one shared stylesheet, linked by every page
js/shared.js                 icons, seed data, storage + session helpers, nav/footer — loaded by every page
js/<page-name>.js            the logic for that one page only
```

Every page loads `js/shared.js` first, then its own small script. Navigation
between pages is just normal `<a href="...">` links and `location.href =`
— there's no client-side router anymore.

## How session + data work across separate pages

A single HTML file could keep everything in one JavaScript variable in
memory. Separate pages can't do that — each one is a fresh page load. Two
different pieces of `window.storage` handle this:

- **Shared storage** (`shared: true`) — the actual "database": users,
  projects, doubts, mentor applications, site content, etc. Same as before.
- **Personal storage** (`shared: false`) — new in this version. Holds just
  *your* session (who's logged in, whether you're in the admin console) so
  it survives clicking from page to page, without using
  `localStorage`/`sessionStorage`/cookies (which aren't available/supported
  in this artifact environment).

Team workspace data (chat, tasks, notes, discussion, calendar) is now also
persisted per-project in shared storage, so it's still there if you leave a
project's workspace and come back — the single-file version kept that only
in memory, which doesn't work once "coming back" means a real new page load.

## Running it

**Inside Claude.ai:** open `index.html` as an artifact and it works exactly
as before — storage is live, multi-user, and persists.

**Outside Claude.ai** (opened locally, or hosted on any static host —
GitHub Pages, Netlify, S3, etc.): `window.storage` doesn't exist there, so
every page falls back to its built-in seed data and a logged-out state on
each load. The site is fully browsable and every page renders correctly,
but actions like signing up or posting a doubt won't be remembered once you
navigate away — there's no server to remember them. That's inherent to a
storage-free static site, not a bug in this conversion. For real,
durable, multi-user persistence outside of Claude.ai, you'd still want the
Postgres/Supabase backend described in the earlier `SETUP-GUIDE.md` and
`schema.sql` — this version deliberately keeps the original tech stack
instead of adding one.

For the smoothest local preview, serve the folder instead of opening the
file directly (avoids browser file:// quirks with relative paths):

```bash
cd scibridge-site
python3 -m http.server 8080
# then open http://localhost:8080
```

## Admin console

Footer → "Admin Login", or go straight to `admin-login.html`. Demo
credentials are shown right on that screen — same caveat as before: this is
a UI-level gate, not real security, since there's no backend to enforce it.

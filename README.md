# Remix Email Composer

- Developement: `npm run dev`
- Build: `npm run build`
- Deploy: `git push`

## How to compose an email

1. Open editor
2. Start a new file _or_ pull in one from GitHub
3. Make changes (hit save to persist changes)
4. Click "Copy HTML"
5. Go to Convertkit, paste contents in a new email as an HTML block
6. Send email

## ToDos

Must fix:

- Get the logo hosted off cdn.jim-nielsen.com
- Fix relevant TODO items in code
  - Refactor to support `/`, `/create`, and `/edit?id=` routes
- Update README on how to use this to author & send an email
  - Where does this code live & get hosted?
- Is how we're authenticating this ok? Do we really want to have an open "Save to GitHub" out on the web somewhere? (They'll only ever be able to save to an open repo)

For later (in order):

- Fix scroll restoration so it doesn't jump on refresh
- Light/dark mode on client
- Responsive
- Store email being composed in the browser in localStorage
- Sync scrolling between two panes
- File bugs with `@ryanflorence/md`
  - Opt out of showing the "link" icons
  - `processMarkdown` crashes with the string "#" or "# "

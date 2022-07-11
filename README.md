# Remix Email Composer

- Development: `npm run dev`
- Build: `npm run build`
- Deploy: `git push`

## Writing an email

See the README in [@remix-run/newsletter](https://github.com/remix-run/newsletter).

## ToDos

Must fix:

- Update README on how to use this to author & send an email
  - Where does this code live & get hosted?
- Is how we're authenticating this ok? Do we really want to have an open "Save to GitHub" out on the web somewhere? (They'll only ever be able to save to an open repo)

For later (in order):

- Pull in files from GitHub
  - Refactor to support `/`, `/create`, and `/edit?id=` routes
- Fix relevant TODO items in code
- Fix scroll restoration so it doesn't jump on refresh
- Responsive
- Store email being composed in the browser in localStorage?
- Sync scrolling between two panes
- File bugs with `@ryanflorence/md`
  - Opt out of showing the "link" icons
  - `processMarkdown` crashes with the string "#" or "# "

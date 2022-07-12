# Remix Email Composer

- Development: `npm run dev`
- Build & Deploy happens via Netlify (`git push` changes to `main`)

## Composing an email

See the README in [@remix-run/newsletter](https://github.com/remix-run/newsletter).

## ToDos

For later (in order):

- Fix timely TODO items in code
- Is how we're authenticating this ok? Do we really want to have an open "Save to GitHub" out on the web somewhere? (They'll only ever be able to save to an open repo)
- Where does this code live & get hosted?
- Fix scroll restoration so it doesn't jump on refresh
  - Not sure this is possible, since it's a `<iframe srcDoc={html}>`
- Sync scrolling between two panes
- Responsive
- Store email being composed in the browser in localStorage?
- File bugs with `@ryanflorence/md`
  - Opt out of showing the "link" icons
  - `processMarkdown` crashes with the string "#" or "# "

import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { processMarkdown } from "@ryanflorence/md";
import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import mjml from "../mjml.server.js";
import { getFile, getFiles, putFile } from "../api.server.js";

const btnClassNames = `appearance-none border border-gray-200 bg-white dark:bg-inherit hover:border-gray-300 disabled:opacity-50 disabled:border-gray-100 px-3 py-1.5 rounded outline-blue-300`;

/**
 * If a `file` parameter is specificed, look at `remix-run/newsletter` on Github
 * and look in `archive/${file}` for that file. Return its contents.
 * If nothing is found, just redirect to home (clearing the query param).
 * @returns {{
 *   file: string,
 *   md: string,
 *   emailHtml: string,
 *   emailTemplateHtml: string,
 *   emailBodyHtml: string
 * }}
 */
export async function loader({ request }) {
  const url = new URL(request.url);
  const file = url.searchParams.get("file") || "";

  // If relevant, get a pre-exisiting markdown file from GitHub
  let md = getPlaceholderMd();
  let sha = "";
  if (file) {
    try {
      ({ md, sha } = await getFile(file));
    } catch (e) {
      console.log(
        `Failed to load \`${file}\` from GitHub (%s). Falling back to empty template…`,
        e.status
      );
    }
  }

  // If we don't have a GitHub file, we'll fetch the available ones
  let files = [];
  if (!file) {
    try {
      files = await getFiles();
    } catch (e) {
      console.error("Failed to fetch files on GitHub", e);
    }
  }

  // NOTE: there's a bug in `processMarkdown` where it won't process the string "#" or "# "
  const htmlFromMd = await processMarkdown(md);
  const { emailHtml, emailBodyHtml } = mjml(htmlFromMd);

  return json({
    sha,
    file,
    files,
    md,
    emailHtml,
    emailBodyHtml,
  });
}

export default function Index() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  let {
    error,
    file,
    files,
    md,
    sha,
    emailHtml,
    emailTemplateHtml,
    emailBodyHtml,
  } = actionData ? actionData : loaderData;
  const submit = useSubmit();
  const transition = useTransition();
  const isLoading =
    transition.state === "submitting" || transition.state === "loading";

  // Am i doing this right? https://dmitripavlutin.com/react-throttle-debounce/
  const handleChange = (e) => {
    submit(e.target.form, { replace: true });
  };
  const debouncedEventHandler = useMemo(() => debounce(handleChange, 300), []);

  return (
    <div className="w-full h-full">
      {error && (
        <div className="text-white bg-red-600 fixed w-full max-w-lg mx-auto rounded-lg px-4 py-2 bottom-4 left-2">
          {error}
        </div>
      )}
      <div className="w-full fixed top-0 left-0 flex items-center h-14 gap-4 px-8 bg-gray-50 dark:bg-neutral-900">
        <div className="flex items-center justify-center w-8 h-8 -ml-2">
          {isLoading ? (
            <img
              src="/spinner.gif"
              alt="Loading spinner"
              width="24"
              height="24"
              className="opacity-50"
            />
          ) : file ? (
            <Link
              to={"/"}
              className="text-2xl opacity-30 hover:opacity-100 relative -top-0.5"
              title="Clear"
              aria-label="Clear"
            >
              ×
            </Link>
          ) : (
            ""
          )}
        </div>
        <div className="flex items-center justify-between gap-8 grow">
          {file ? (
            <>
              <div className="flex items-center gap-4">
                <strong className="font-mono">{file}</strong>

                <button
                  disabled={isLoading}
                  type="submit"
                  name="_action"
                  value="save-to-github"
                  form="form-with-md"
                  className={btnClassNames}
                >
                  {sha ? "Sync" : "Save"} to GitHub
                </button>

                {/* TODO make this more progressively-enhanced */}
                <noscript>
                  <button type="submit" className={btnClassNames}>
                    Submit
                  </button>
                </noscript>
              </div>

              <div className="flex gap-2">
                <CopyButton
                  label="Copy Body"
                  textToCopy={emailBodyHtml}
                ></CopyButton>
                <CopyButton
                  label="Copy Template"
                  textToCopy={emailTemplateHtml}
                ></CopyButton>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-8">
              <Form method="get" className="flex items-center gap-1">
                <input
                  type="text"
                  name="file"
                  placeholder="MMMM-DD-YY-your-slug.md"
                  pattern="\d{4}-\d{2}-\d{2}(.*).md"
                  defaultValue={
                    new Date().toISOString().slice(0, 10) + "-your-slug.md"
                  }
                  required
                  className={btnClassNames + " w-72"}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={btnClassNames}
                  disabled={isLoading}
                >
                  New File
                </button>
              </Form>
              <Form method="get" className="flex items-center gap-1">
                <select
                  name="file"
                  onChange={(e) => {
                    submit(e.target.form, { replace: true });
                  }}
                  defaultValue=""
                  className={btnClassNames}
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Choose a file from GitHub…
                  </option>
                  {files.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <noscript>
                  <button type="submit" className={btnClassNames}>
                    Load File
                  </button>
                </noscript>
              </Form>
            </div>
          )}
        </div>
      </div>
      {file && (
        <div className="w-full h-full flex" style={{ overflow: "hidden" }}>
          {/* Preserve the `file` query param across requests 
              https://github.com/remix-run/remix/issues/3133 */}
          <Form
            method="post"
            action={`/?index${file && `&file=${file}`}`}
            className="w-1/2 h-full pt-14 border-r border-gray-100"
            id="form-with-md"
          >
            <input type="hidden" value={sha} name="sha" />
            <textarea
              name="md"
              placeholder={getPlaceholderMd()}
              defaultValue={md}
              onChange={debouncedEventHandler}
              className="font-mono w-full h-full outline-none p-8 leading-relaxed bg-inherit"
            ></textarea>
          </Form>

          <output className="w-1/2 h-full">
            <iframe
              title="Email template preview"
              srcDoc={emailHtml}
              className="h-full w-full pt-14"
            />
          </output>
        </div>
      )}
    </div>
  );
}

export async function action({ request }) {
  const url = new URL(request.url);
  const file = url.searchParams.get("file") || "";

  const formData = await request.formData();
  const action = formData.get("_action");
  const md = formData.get("md");
  let sha = formData.get("sha");
  const htmlFromMd = await processMarkdown(md);
  const { emailHtml, emailTemplateHtml, emailBodyHtml } = mjml(htmlFromMd);

  let error = "";
  if (action === "save-to-github") {
    console.log("SAVING TO GITHUB...", file, sha);
    try {
      // If we're saving the file, not syncing it, let's get back the sha
      // and pass it back to the client so now we know we're syncing not saving
      ({ sha } = await putFile({ file, md, sha }));
    } catch (e) {
      console.log("Failed to save file to GitHub.", e);
      error = e.toString();
    }
  }

  return json({
    ...(error ? { error } : {}),
    file,
    md,
    sha,
    emailHtml,
    emailTemplateHtml,
    emailBodyHtml,
  });
}

function CopyButton({ textToCopy, label }) {
  const [clicked, setClicked] = useState(false);

  // TODO what's the right way to progressively-enhance these suckers?
  return (
    <button
      type="button"
      disabled={clicked}
      className={btnClassNames}
      onClick={(e) => {
        navigator.clipboard.writeText(textToCopy);
        setClicked(true);
        setTimeout(() => {
          setClicked(false);
        }, 2000);
      }}
    >
      {clicked ? "Copied!" : label}
    </button>
  );
}

function getPlaceholderMd() {
  return `# Sample Email Title

One introductory paragraph of text here. Be concise.

---

![section image](https://user-images.githubusercontent.com/1316441/173408253-fb2574ef-5252-434e-8782-706e873512cf.jpg)

## Section Title

Section content goes here. It’s contents can be a paragraph, a list, etc.

**[Call to action](...) →**

---

[another section]`;
}

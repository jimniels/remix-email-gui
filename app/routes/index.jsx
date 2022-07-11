import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { processMarkdown } from "@ryanflorence/md";
import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import mjml from "../mjml.server.js";
import { getFile, putFile } from "../api.server.js";

/**
 * If a `file` parameter is specificed, look at `remix-run/newsletter` on Github
 * and look in `archive/${file}` for that file. Return its contents.
 * If nothing is found, just redirect to home (clearing the query param).
 * @returns {{ file: string, md: string, emailHtml: string, emailTemplateHtml: string , emailBodyHtml: string }}
 */
export async function loader({ request }) {
  const url = new URL(request.url);
  let file = url.searchParams.get("file") || "";
  let md = getPlaceholderMd();

  if (file) {
    try {
      md = await getFile(file);
    } catch (e) {
      console.log(
        `Failed to load \`${file}\` from GitHub. Redirecting to home…`,
        e
      );
      return redirect("/");
    }
  }

  // NOTE: there's a bug in `processMarkdown` where it won't process the string "#" or "# "
  const htmlFromMd = await processMarkdown(md);
  const { emailHtml, emailTemplateHtml, emailBodyHtml } = mjml(htmlFromMd);

  return json({
    file,
    md,
    emailHtml,
    emailTemplateHtml,
    emailBodyHtml,
  });
}

export default function Index() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  let { error, file, md, emailHtml, emailTemplateHtml, emailBodyHtml } =
    actionData ? actionData : loaderData;
  const submit = useSubmit();
  const transition = useTransition();

  const isLoading = transition.state === "submitting";

  // Am i doing this right? https://dmitripavlutin.com/react-throttle-debounce/
  const handleChange = (e) => {
    submit(e.target.form, { replace: true });
  };
  const debouncedEventHandler = useMemo(() => debounce(handleChange, 300), []);

  return (
    <div className="wrapper">
      {error && <div className="error">{error}</div>}
      <div className="container">
        <Form method="post" className="container__in">
          <div className="toolbar">
            <div className="toolbar__left">
              <input
                name="file"
                type="text"
                placeholder="MMMM-DD-YY-slug.md"
                pattern="\d{4}-\d{2}-\d{2}(.*).md"
                defaultValue={file}
              />
            </div>
            <div className="toolbar__right">
              <div className="input-group">
                <button
                  disabled={isLoading}
                  type="submit"
                  name="_action"
                  value="save-to-github"
                >
                  Save to GitHub
                </button>
              </div>
              {/* TODO make this more progressively-enhanced */}
              <noscript>
                <button type="submit">Submit</button>
              </noscript>
              <a href="/" aria-label="Reset">
                ×
              </a>
            </div>
          </div>
          <textarea
            name="md"
            placeholder={getPlaceholderMd()}
            defaultValue={md}
            onChange={debouncedEventHandler}
          ></textarea>
        </Form>

        <output className="container__out">
          <div className="toolbar">
            <div className="toolbar__left">
              <img
                src="/spinner.gif"
                alt="Loading spinner"
                width="24"
                height="24"
                hidden={!isLoading}
              />
            </div>
            <div className="toolbar__right">
              <div className="input-group">
                <CopyButton
                  label="Copy Body"
                  textToCopy={emailBodyHtml}
                ></CopyButton>
                <CopyButton
                  label="Copy Template"
                  textToCopy={emailTemplateHtml}
                ></CopyButton>
              </div>
            </div>
          </div>
          <iframe title="Email template preview" srcDoc={emailHtml} />
        </output>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("_action");
  const file = formData.get("file");
  const md = formData.get("md");
  const htmlFromMd = await processMarkdown(md);
  const { emailHtml, emailTemplateHtml, emailBodyHtml } = mjml(htmlFromMd);

  let error = "";
  if (action === "save-to-github") {
    console.log("SAVING TO GITHUB...", file);
    try {
      if (!file) {
        throw new Error("Must provide a file name to save to GitHub.");
      }
      await putFile(file, md);
    } catch (e) {
      error = e.toString();
    }
  }

  return json({
    ...(error ? { error } : {}),
    file,
    md,
    emailHtml,
    emailTemplateHtml,
    emailBodyHtml,
  });
}

function CopyButton({ textToCopy, label }) {
  const [clicked, setClicked] = useState(false);

  return (
    <button
      type="button"
      disabled={clicked}
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

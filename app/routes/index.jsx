import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { processMarkdown } from "@ryanflorence/md";
import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import mjml from "../mjml.server.js";

export async function loader({ request, params }) {
  // NOTE: there's a bug in `processMarkdown` where it won't process the string "#" or "# "
  const md = getPlaceholderMd();
  const htmlBody = await processMarkdown(md);
  const html = mjml(htmlBody);

  return json({
    md,
    html,
    htmlBody,
  });
}

export default function Index() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  let { htmlBody, html, md } = actionData ? actionData : loaderData;
  const submit = useSubmit();
  const transition = useTransition();

  const isLoading = transition.state === "submitting";

  // Am i doing this right? https://dmitripavlutin.com/react-throttle-debounce/
  const handleChange = (e) => {
    console.log("Fire server call");
    submit(e.target.form, { replace: true });
  };
  const debouncedEventHandler = useMemo(() => debounce(handleChange, 300), []);

  return (
    <Form method="post" className="container">
      <textarea
        name="md"
        placeholder={getPlaceholderMd()}
        className="container__in"
        defaultValue={md}
        onChange={debouncedEventHandler}
      ></textarea>

      <div className="container__out">
        <iframe title="Email template preview" srcDoc={html} />
      </div>

      <div className="container__actions">
        <div className="actions">
          <button type="submit">Submit</button>
          <CopyButton textToCopy={htmlBody} />
        </div>

        <img
          src="/spinner.gif"
          alt="Loading spinner"
          className="spinner"
          width="24"
          height="24"
          hidden={!isLoading}
        />
      </div>

      <div></div>
    </Form>
  );
}

function CopyButton({ textToCopy = "" }) {
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
      {clicked ? "Copied!" : "Copy HTML"}
    </button>
  );
}

export async function action({ request }) {
  console.log("FIRED THE ACTION HERE");
  const formData = await request.formData();
  const md = formData.get("md");
  const html = await processMarkdown(md);

  // if there's no POST data we expect, redirect to /
  return json({ md, html: mjml(html) });
}

function useLocalStorage(key) {
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(localStorage.getItem(key));
  }, [key]);

  const setWithLocalStorage = (nextState) => {
    setState(nextState);
  };

  return [state, setWithLocalStorage];
}

function getPlaceholderMd() {
  return `# Email Title

An introductory paragraph of text.

---

![section image](https://user-images.githubusercontent.com/1316441/173408253-fb2574ef-5252-434e-8782-706e873512cf.jpg)

## Section Title

Section content goes here. It can be a paragraph, a list, etc.

**[Call to action](...) →**

---

[another section]`;
}

import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const owner = "remix-run";
const repo = "newsletter";

export async function getFile(file) {
  try {
    const res = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path: `archive/${file}`,
      }
    );
    const md = Buffer.from(res.data.content, "base64").toString("utf-8");
    return md;
  } catch (e) {
    console.error("Failed to fetch file from GitHub.", e);
    return "";
  }
}

/**
 * Take a file path and its contents and upload it to GitHub
 * @param {string} file - Name of the file
 * @param {string} str - Contents of the file (in plain text)
 * @returns
 */
export async function putFile(file, body) {
  // See if the file already exists
  let sha = "";
  const res1 = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path: `archive/${file}`,
    }
  );
  if (res1?.data?.sha) {
    sha = res1.data.sha;
  }

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: `archive/${file}`,
    message: `docs(www): update from website tool`,
    // @TODO change to a "machine user", or in a real fancy world allow user auth...
    committer: {
      name: "Jim Nielsen",
      email: "jimniels@gmail.com",
    },
    content: Buffer.from(body, "utf-8").toString("base64"),
    ...(sha ? { sha } : {}),
  });

  return;
}

import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const owner = "remix-run";
const repo = "newsletter";

export async function getFile(file) {
  const res = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path: `archive/${file}`,
    }
  );
  const sha = res.data.sha;
  const md = Buffer.from(res.data.content, "base64").toString("utf-8");
  return { md, sha };
}

/**
 * Get a list of files in the newsletter archive
 * @returns {Array.<string>}
 */
export async function getFiles() {
  const res = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path: `archive`,
    }
  );
  return res.data.map((item) => item.name).reverse();
}

/**
 * Take a file path and its contents and upload it to GitHub
 * @param {string} file - Name of the file
 * @param {string} str - Contents of the file (in plain text)
 * @param {string?} sha
 * @returns
 */
export async function putFile({ file, md, sha }) {
  const res = await octokit.request(
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path: `archive/${file}`,
      message: `docs(www): update from website tool`,
      // @TODO change to a "machine user", or in a real fancy world allow user auth...
      committer: {
        name: "Jim Nielsen",
        email: "jimniels@gmail.com",
      },
      content: Buffer.from(md, "utf-8").toString("base64"),
      // If the sha doesn't exist, that means we're creating a new file
      ...(sha ? { sha } : {}),
    }
  );

  return { sha: res.data.content.sha };
}

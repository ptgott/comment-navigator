#!/usr/bin/env node

/**
 * This node script builds the user script and sends it to a private gist
 * linked to your own GitHub account. This allows you to examine
 * your changes in an environment that's as real as it gets without
 * affecting users.
 *
 * NOTE that this script doesn't validate its inputs. We trust you,
 * but be careful!
 */

// https://octokit.github.io/rest.js/v18#usage
const { Octokit } = require("@octokit/rest");
const { env } = require("process");
const { argv } = require("yargs");
const { readFileSync } = require("fs");
const { stripIndents } = require("common-tags");
const child_process = require("child_process");
const process = require("process");

// Bail out early if there's no GITHUB_TOKEN
if (!env.GITHUB_TOKEN || env.GITHUB_TOKEN == "") {
  throw new Error(
    "You need to assign a value to the GITHUB_TOKEN environment variable"
  );
}

if (!argv.gistfile) {
  throw new Error(
    "You need to provide a value for --gistfile that points to the local file to upload."
  );
}

const octokit = new Octokit({
  auth: env["GITHUB_TOKEN"],
  userAgent: "Docs Comment Navigator staging script",
});

process.stdout.write(
  "Pushing the user script to a private gist in your GitHub account...\n"
);

// We'll name the staging gist after the name of your local feature branch.
const branchname = child_process.execSync("git branch --show-current");

// Make the filename URL safe and remove whitespace, which can lead to
// weird URL-encodings.
const filename =
  "comment-nav-" + encodeURIComponent(branchname.toString("utf8").trim());

process.stdout.write(`Your gist will be called ${filename}.\n`);

// The path of the gist file we'll upload
const gistfile = argv.gistfile;

process.stdout.write("Getting the URL of your new gist...");

// Create an empty gist first in order to retrieve its URL and ID.
// We'll use this to finish populating the userscript headers.
let gistURL;
let gistId;

// Octokit's functions are all asynchronous, so we need to wrap them
// in async blocks to use await. Sorry about the gross control flow!
(async () => {
  // We'll start by uploading an empty file.
  let files = {};
  files[filename] = {};
  // The structure of the files object is documented here:
  // https://developer.github.com/v3/gists/#create-a-gist
  // We need to add provisional content. The payload
  // fails validation if the content is all whitespace.
  files[filename].content = "awaiting content...";

  try {
    const payload = {
      files: files,
      public: false,
      description: `Staging site for ${branchname}`,
    };
    const newGistResp = await octokit.gists.create(payload);
    if (newGistResp.status == 201) {
      gistURL = newGistResp.data.html_url;
      gistId = newGistResp.data.id;
      process.stdout.write("done\n");
      process.stdout.write(
        `You'll find your gist at:\n${gistURL}\n...with ID:\n${gistId}\n`
      );
    } else {
      process.stderr.write(
        `Couldn't create a new gist. Got status ${newGistResp.status}.`
      );
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`\nCouldn't create the gist.\n${err}\n`);
  }

  process.stdout.write(`Building ${gistfile}...`);
  // Make sure the final userscript is up to date.
  // This also populates the source header.
  child_process.execSync(`gistUrl="${gistURL}" npm run build`);
  process.stdout.write(`done\n`);
  // Update the file content to upload.
  files[filename].content = readFileSync(gistfile, "utf-8");

  process.stdout.write(`Uploading content to the new gist...`);
  try {
    const updateResp = await octokit.gists.update({
      gist_id: gistId,
      files: files,
    });
    if (updateResp.status == 200) {
      process.stdout.write(
        `done\nUploaded the gist successfully to:\n${updateResp.data.html_url}\n`
      );
    } else {
      process.stderr.write(stripIndents`\nCouldn't create your staging gist.
    Received a status code of ${resp.status}.
    Here's the full body of the response:
    ${resp.data}
    `);
    }
  } catch (err) {
    process.stderr.write(`\nCouldn't add content for the gist.\n${err}\n`);
  }
})().catch((err) => {
  process.stderr.write(`\nCouldn't create the gist.\n${err}\n`);
});

// This script starts the e2e test server. It's meant
// to be shut down unceremoniously by a shell when
// the test suite finishes.

import * as express from "express";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../lib/test-utils/mock-html";

import { env } from "process";
import * as fs from "fs";
import { Server } from "http";
import path from "path";
import { safeLoad } from "js-yaml";
import { activeThread, conversationWrapper } from "../lib/constants/selectors";
import * as selectors from "../lib/constants/selectors";

export interface commentConfig {
  author: string;
  text: string;
}

export interface threadConfig {
  type: string;
  author: string;
  text: string;
  replies: Array<commentConfig>;
}

const fixture = safeLoad(
  fs.readFileSync(path.join("src", "e2e", "fixture.yaml"), "utf8")
);

const threadObjects = fixture.map((obj: threadConfig) => {
  const opts = {
    author: obj.author,
    text: obj.text,
    replies: obj.replies,
  };

  if (obj.type == "commentThread") {
    return MockCommentThread(opts);
  } else if (obj.type == "suggestionThread") {
    return MockSuggestionThread(opts);
  }
});

const threads = threadObjects.join("\n");

// Path to the main frontend bundle containing the
// Comment Navigator application
const bundlePath = env.BUNDLE_PATH;
// Path to global variables/functions used for debugging
// and running e2e tests
const e2eGlobalsPath = env.E2E_GLOBALS_PATH;
const bundle = fs.readFileSync(bundlePath, "utf8");
const e2eGlobals = fs.readFileSync(e2eGlobalsPath, "utf8");
const discussionContextClass = selectors.discussionScrollContext.replace(
  ".",
  ""
);

const templ = `
  <!DOCTYPE html>
  <head>
  <style type="text/css">
  body {
    /* As in Google Docs */
    overflow: hidden
  }
  ${activeThread} {
    /* For debugging */
    border: 1px solid red !important;
  }
  ${conversationWrapper} {
    border: 1px solid black;
    padding: 2px;
    max-width: 500px;
    margin: 20px;
  }
  div#conversations {
    position: absolute;
    /* Google Docs pages have a high z-index, so we add one
    here too to ensure the navigator remains visible. */
    z-index: 1000;
  }
  div.${discussionContextClass} {
    /* As in Google Docs */
    overflow: auto;
  }
  </style>
  </head>
  <body>
    <!--used here to artificially isolate thread elements-->
    <!--
      This is the div class used in Google Docs to enclose
      discussion thread elements.
    -->
    <div class="${discussionContextClass}">
    ${threads}
    </div>
    <script>
    ${bundle}
    </script>
    <script>
    ${e2eGlobals}
    </script>
  </body>
  </html>
  `;

// Create a new express app instance
const app = express();
app.get("/", function (req, res) {
  res.send(templ);
  return;
});

// Used by the parent shell to check health
// before running tests.
app.get("/health", function (req, res) {
  res.send("ok");
  return;
});

const port = env.APP_PORT; // Host will always be localhost
let srv: Server;
srv = app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});

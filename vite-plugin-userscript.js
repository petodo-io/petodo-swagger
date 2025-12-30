export function userscriptPlugin() {
  const metadata = `// ==UserScript==
// @name         Petodo Swagger Plugins
// @namespace    https://github.com/petodo-io
// @version      0.1.0
// @description  Plugins for improving Swagger UI: copy compact format, favorites endpoints, search
// @author       Petodo
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==`;

  return {
    name: "userscript",
    enforce: "post",
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && fileName.endsWith(".user.js")) {
          if (!chunk.code.includes("==UserScript==")) {
            chunk.code = metadata + "\n\n" + chunk.code;
          }
        }
      }
    },
  };
}

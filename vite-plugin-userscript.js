export function userscriptPlugin() {
  const metadata = `// ==UserScript==
// @name         Petodo Swagger Plugins
// @namespace    https://github.com/petodo-io
// @version      0.1.1
// @description  Plugins for improving Swagger UI: copy compact format, favorites endpoints, search
// @author       Petodo
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/petodo-io/petodo-swagger-plugin/main/dist/petodo-swagger.user.js
// @downloadURL  https://raw.githubusercontent.com/petodo-io/petodo-swagger-plugin/main/dist/petodo-swagger.user.js
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

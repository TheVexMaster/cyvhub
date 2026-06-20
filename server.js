const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 8000;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const requestPath = request.url.split("?")[0];
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.join(root, normalizedPath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("Not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", contentTypes[path.extname(filePath)] || "application/octet-stream");
    response.end(content);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CYV Hub running at http://127.0.0.1:${port}`);
});

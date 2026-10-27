const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

function staticFile(pathname, res) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        res.writeHead(400);
        return res.end("Bad request");
    }
    if (decoded === "/") {
        decoded = "/Index.html";
    }

    const isPublicScript = /^\/scripts\/[a-z0-9-]+\.js$/i.test(decoded);
    const isPublicFile = decoded === "/Index.html" || decoded === "/Breaches.JSON" || isPublicScript;
    if (!isPublicFile) {
        res.writeHead(404);
        return res.end("Not found");
    }

    const file = path.join(ROOT, decoded.slice(1));
    fs.readFile(file, function (error, content) {
        if (error) {
            res.writeHead(error.code === "ENOENT" ? 404 : 500);
            return res.end(error.code === "ENOENT" ? "Not found" : "Could not read file");
        }
        const extension = path.extname(file).toLowerCase();
        const contentType = {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8"
        }[extension] || "application/octet-stream";
        res.writeHead(200, {
            "Content-Type": contentType,
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        });
        res.end(content);
    });
}

const server = http.createServer(async function (req, res) {
    let pathname;
    try {
        pathname = new URL(req.url, "http://localhost").pathname;
    } catch {
        res.writeHead(400);
        return res.end("Invalid request URL");
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" });
        return res.end("Method not allowed");
    }
    staticFile(pathname, res);
});

server.listen(PORT, HOST, function () {
    console.log("CyberShield is running at http://" + HOST + ":" + PORT);
}).on("error", function (error) {
    console.error("Could not start CyberShield:", error);
    process.exitCode = 1;
});

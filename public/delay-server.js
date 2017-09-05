var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = parseInt(process.argv[2] || 5001, 10);

var contentType = {
    html: "text/html",
    woff2: "font/woff2",
    css: "text/css",
    js: "application/javascript",
    ico: "image/x-icon"
};

http.createServer(function(request, response) {
    var uri = url.parse(request.url);
    var filename = path.join(process.cwd(), uri.pathname);
    var params = (uri.search || '').substr(1).split('&').reduce((m, x) => {
        var p = x.split('=');
        m[p[0]] = p[1];
        return m;
    }, {});
    var delay = parseInt(params.delay, 10);

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, "binary", function(err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            var extension = filename.substr(filename.lastIndexOf('.') + 1);
            console.log('Serving: ' + filename + ' (' + contentType[extension] + ')');

            setTimeout(function() {
                response.writeHead(200, {
                    "Content-Type": contentType[extension]
                });
                response.write(file, "binary");
                response.end();
            }, delay);
        });
    });
}).listen(port);

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

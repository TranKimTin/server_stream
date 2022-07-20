const express = require("express");
const app = express();
const fs = require("fs");

app.get("/:name", function (req, res) {
    let { name } = req.params;
    let html = `
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Tín</title>
            <style>
                body {
                    margin: 0;
                    max-width: 100%;
                    background-color: rgb(14, 14, 14);
                    margin: 5%;
                    /* padding-top: 10%; */
                    /* padding-left: 35%; */
                }
            </style>
        </head>
        <body>
            <video id="videoPlayer" width="90%" controls muted="muted" autoplay controlsList="nodownload">
                <source src="/video/${name}" type="video/mp4"/>
            </video>
        </body>
    </html>
    `
    res.send(html);
});

app.get("/video/:name", function (req, res) {
    try {
        const range = req.headers.range;
        const { name = '' } = req.params;
        console.log({ name, range });
        if (!range) {
            res.status(400).send("Requires Range header");
        }
        if (name == '') {
            res.status(400).send("File error");
        }
        const videoPath = `./video/${name}.mp4`;
        const videoSize = fs.statSync(videoPath).size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
    }
    catch (err) {
        console.log(err);
        res.status(400).send("File error");
    }
});

app.listen(8000, function () {
    console.log("Listening on port 8000!");
});
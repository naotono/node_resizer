const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.post("/", (req, res) => {
    // console.log(req.body);

    const img = req.body.data;
    const data = img.replace(/^data:image\/\w+;base64,/, "");
    const buf = new Buffer.from(data, 'base64');
    fs.writeFileSync('./image.jpg', buf);

    sharp("./image.jpg")
        .resize(512)
        .toFile('output.jpg', (err, info) => {
            if (err) throw err;
        })


    fs.readFile("./output.jpg", (err, data) => {
        if (err) throw err;
        let buff = new Buffer.from(data);
        let base64data = buff.toString('base64');
        res.send(base64data);
    })
})

app.listen(3000, () => console.log("Server running..."));
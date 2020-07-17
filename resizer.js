const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const rimraf = require("rimraf");

const app = express();
const zip = new AdmZip();

sharp.cache({ files: 0 });
sharp.cache(false);

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.post("/", async (req, res) => {

    const folderName = makeid(10);
    fs.mkdirSync(folderName);





    function imageProcess(item) {
        return new Promise((resolve, rejects) => {
            console.log(item);
            const img = item.base64;
            const data = img.replace(/^data:image\/\w+;base64,/, "");
            const buf = new Buffer.from(data, 'base64');
            fs.writeFileSync('./' + folderName + "/" + item.name.replace(/png/, "jpg"), buf);



            sharp('./' + folderName + "/" + item.name.replace(/png/, "jpg"))
                .resize(640)
                .jpeg()
                .toBuffer(function (err, buffer) {
                    if (err) throw err;
                    fs.writeFile('./' + folderName + "/" + item.name.replace(/png/, "jpg"), buffer, function (e) {
                        if (err) throw err;
                        resolve();
                    })
                })
        })
    }


    req.body.data.forEach(async item => {
        await imageProcess(item);
    })

    setTimeout(async () => {
        const files = fs.readdirSync(folderName);
        console.log(files);
        files.forEach(file => {
            const data = fs.readFileSync(folderName + "/" + file);
            zip.addFile(file, data);
        })

        await zip.writeZip(path.resolve(__dirname, './' + folderName + '.zip'));

        fs.readFile('./' + folderName + '.zip', (err, data) => {
            if (err) throw err;
            let buff = new Buffer.from(data);
            let base64data = buff.toString('base64');
            res.send(base64data);

            // Remove Files in Zip
            const folder = fs.readdirSync(folderName);
            folder.forEach(file => {
                zip.deleteFile(file)
            })

            setTimeout(() => {
                rimraf(folderName, function () { console.log("done"); })
                rimraf('./' + folderName + '.zip', function () { console.log("done"); })
            }, 3000)
        })
    }, 1000)
})

app.listen(2000, () => console.log("Server running..."));
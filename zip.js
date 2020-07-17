const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

let files = fs.readdirSync("./");
files = files.filter(file => file.includes("jpg"));

const zip = new AdmZip();

files.forEach(file => {
    const data = fs.readFileSync(file);
    console.log(data);
    zip.addFile(file, data)
})

zip.writeZip(path.resolve(__dirname, './images.zip'))
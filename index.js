const express = require("express");
const fs = require("fs");
const sharp = require("sharp");

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse" ));

obGlobal = {
    erori: null,
    imagini: null
}

function createImages() {
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf8");
    //console.log(continutFisier);
    var obiect = JSON.parse(continutFisier);
    var dim_mediu = 200
    var dim_mic = 100
    obGlobal.imagini = obiect.imagini;
    obGlobal.imagini.forEach(function (elem) {
        [numefisier, extensie] = elem.fisier.split('.');
        if (!fs.existsSync(obiect.cale_galerie + '/mediu/')) {
            fs.mkdirSync(obiect.cale_galerie + '/mediu/');
        }
        elem.fisier_mediu = obiect.cale_galerie + '/mediu/' + numefisier + '.webp';
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;
        sharp(__dirname + '/' + elem.fisier).resize(dim_mediu).toFile(__dirname + '/' + elem.fisier_mediu);
    })
    //console.log(obGlobal.imagini);
}

createImages();


function createErrors() {
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf8");
    obGlobal.erori = JSON.parse(continutFisier);
}
createErrors();

function renderError(res, identificator, titlu, text, imagine) {
    var eroare = obGlobal.erori.info_erori.find(function (elem) {
        return elem.identificator == identificator;
    })
    titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine = imagine || (eroare && obGlobal.erori.cale_baza + "/" + eroare.imagine) || obGlobal.erori.cale_baza + "/" + obGlobal.erori.eroare_default.imagine;
    if (eroare && eroare.status) {
        res.status(identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine })
    }
    else {
        res.render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
    }
}


app.get( ["/", "/index", "/home"], function(req, res) {
    console.log("ceva");
    res.render("pagini/index", {ip: req.ip})
} );

app.get(["/despre", "despre"], function (req, res) {
    res.render("pagini/despre");
});

app.get("/*.ejs", function (req, res) {
    renderError(res, 403);
});

app.get("/*", function (req, res) {
    console.log("url:", req.url);
    res.render("pagini" + req.url, function (err, rezRandare) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                renderError(res, 404);
            }
            else {

            }
        }
        else {
            res.send(rezRandare);
        }


    });
});

console.log("Hello, World!");

app.listen(8080);
console.log("Serverul a pornit");
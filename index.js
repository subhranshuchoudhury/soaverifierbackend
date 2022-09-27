const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const mailer = require("nodemailer");
require("dotenv").config();

const app = express();

// For OTP Verification.

smtpProtocol = mailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
        user: "subhransuchoudhury00@gmail.com",
        pass: process.env.MAIL_PASS,
    }
});

app.use((req, res, next) => { res.header({ "Access-Control-Allow-Origin": "*" }); next(); })

app.get("/", (req, res) => {
    res.send("Father: Subhranshu Choudhury, Project: SOA ITER BTECH VERIFIER! 🛡️")
})

app.get("/verify/:AN/:INPUTNAME", (req, res) => {



    const AN = req.params.AN;
    const INPUT_NAME = req.params.INPUTNAME.toUpperCase();

    // Strictly for 2022 users.

    const url = `http://saat.soa.ac.in/2022/score-card-print.php?APPLNO=${AN}`;

    const scrapeData = async () => {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const userName = $("tr:nth-of-type(1) td.col:nth-of-type(1)").text().trim().split("NAME OF THE CANDIDATE :")[1].trim().toUpperCase();
            const userCourse = $("div:nth-of-type(5) tr:nth-of-type(2) td:nth-of-type(1)").text().trim();
            const userPercentile = $("div:nth-of-type(5) tr:nth-of-type(2) td:nth-of-type(2)").text().trim();

            if (INPUT_NAME === userName) {
                res.send({ userName: userName, userCourse: userCourse, userPercentile: userPercentile, isVerified: true });
            } else {
                res.send({ userInput: INPUT_NAME, userName: userName, isVerified: false, });
            }

        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    scrapeData();



});

app.get("/sendotp/:EMAIL/:OTP", (req, res) => {

    const Email = req.params.EMAIL;
    const OTP = req.params.OTP;

    let MailOption = {
        from: "subhransuchoudhury00@gmail.com",
        to: Email,
        subject: "SOA ITER VERIFIER 🛡️",
        html: `Hey👋! Your SOA Verification OTP is <b style="color:red"><h2>${OTP}</h2></b>`
    }
    smtpProtocol.sendMail(MailOption, function (err, response) {
        if (err) {
            console.log(err);
            res.send({ isSent: false });
        }
        console.log('Message Sent');
        res.send({ isSent: true });
    });
    smtpProtocol.close();
})

app.listen(process.env.PORT || 4000, () => {
    console.log("✅ Active on port: 4000.. or on globe!")
});
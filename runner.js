const express = require("express");
const sha512 = require('js-sha512');
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const moment = require("moment");
const cors = require("cors");
const port = 6969;

const local = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "senslope",
    database: "commons_db"
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    local.query(`SELECT * FROM commons_db.user_accounts INNER JOIN users ON user_accounts.user_fk_id = users.user_id where username = '${username}' limit 1;`, (err, result) => {
        result.forEach(element => {
            if (element.password == sha512(password)) {
                res.send({
                    status: true,
                    message: "Login success!",
                    credentials: element
                });
            } else {
                res.send({
                    status: false,
                    message: "Login failed!"
                });
            }
        });
    });
});

app.get("/get_tasks/:user_id", (req, res) => {
    let query = "SELECT * FROM commons_db.log_frame " + 
                `INNER JOIN log_frame_outputs ON log_frame.id = log_frame_outputs.log_frame_id where log_frame_outputs.user_id = ${req.params.user_id};`;
    local.query(query, (err, result) => {
        let return_value = [];
        result.forEach(element => {
            let temp = {
                ...element,
                activity: []
            };
            let sub_query = `SELECT * FROM log_frame_output_activity WHERE output_id = ${element.output_id}`;
            local.query(sub_query, (err, sub_res) => {
                sub_res.forEach(el => {
                    temp.activity.push(el)
                });
            });
            return_value.push(temp);
        });
        res.send({
            status: true,
            data: return_value
        });
    });
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
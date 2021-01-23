var express = require('express');
var bodyParser = require('body-parser');
var { Pool, Client } = require('pg');

const hostname = '127.0.0.1';
const port = 4000;

/////////////// Connessione al database.
const con = new Client({
  user: "postgres",
  password: "postgresql",
  host:'127.0.0.1',
  port:"5432",
  database:"gymme-db",
	multipleStatements: true
});

con.connect()
.then(() => console.log("Connected successfuly"))
.catch(err => console.log(err));


var app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

app.post('/customer/register/', (req, res, next) => {
  console.log("Rispondo richiesta:'/customer/register/");
  var to_add = req.body;

  var name = to_add.name;
  var lastname = to_add.lastname;
  var birthdate = to_add.birthdate;
  var email = to_add.email;
  var password = to_add.password;
  var user_type = to_add.user_type;

  var height = to_add.height;
  var diseases = to_add.diseases;
  var allergies = to_add.allergies;

  //CONTROLLO CHE NON CI SIA GIA' NEL DB
  var check_query = "SELECT * FROM users WHERE email = \'" + email +"\';";
  con.query(check_query, function(err, result, fields){
    if(err){
      res.json("500");
      console.log('[PostgreSQL ERROR]', err);
    }else {
      if(result.rowCount > 0){
        res.statusCode=500;
        res.json('User already exists!');
      }
      else{
        //INSERISCO DATI NELLA TABELLO users
        var register_query = "INSERT INTO users (name, lastname, birthdate, email, password, user_type) VALUES ('"+name+"', '"+lastname+"', TO_DATE('"+birthdate+"', 'DD/MM/YYYY'), '"+email+"', '"+password+"', '"+user_type+"');";
        con.query(register_query, function(err, result, fields){

          if(err){
            res.json("500");
            console.log('[PostgreSQL ERROR]', err);
          }else {
            //PRENDO user_id DELLO USER APPENA INSERITO
            var userID_query = "SELECT user_id FROM users WHERE email = \'" + email +"\';";
            con.query(userID_query, function(err, result, fields){
              if(err){
                res.json("500");
                console.log('[PostgreSQL ERROR]', err);
              }else {
                if(result.rowCount > 0){
                  var user_id = result.rows[0].user_id;

                  //AGGIUNGO DATI SPEFICI DEL customer
                  var user_query = "INSERT INTO customers (user_id, height, diseases, allergies) VALUES ('"+user_id+"','"+height+"','"+diseases+"','"+allergies+"');";
                  con.query(user_query, function(err, result, fields){
                    if(err){
                      res.json("500");
                      console.log('[PostgreSQL ERROR]', err);
                    }else {
                      //SUCCESS FINALE
                      res.json("200");
                    }
                  });

                } else{
                  res.json("500");
                  console.log('[Register ERROR]', err);
                }
              }
            });
          }
        });
      }
    }
  });
})

app.post('/login/', (req, res, next) => {
  console.log("Rispondo richiesta:'/login/");
  var to_check = req.body;

  var email = to_check.email;
  var user_password = to_check.password;

  var login_query = "SELECT user_id, password, user_type FROM users WHERE email = \'" + email +"\';";
  con.query(login_query, function(err, result, fields){
    if(err){
      res.json("500");
      console.log('[PostgreSQL ERROR]', err);
    }else{
      if(result.rowCount > 0){
        var user_id = result.rows[0].user_id;
        var db_password = result.rows[0].password;
        var user_type = result.rows[0].user_type;

        if(db_password == user_password){
          var to_res = user_id+", "+user_type;
          res.json(to_res);
        } else{
          res.json("403");
          console.log('[LOGIN ERROR: password sbagliata]');
        }

      } else{
        res.json("404");
        console.log('[LOGIN ERROR: email sbagliata o non esistente]');
      }
    }
  });
})

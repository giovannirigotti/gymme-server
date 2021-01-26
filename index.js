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



///////////////////////////////////////
///                                 ///
///            GENERAL              ///
///                                 ///
///////////////////////////////////////

app.get('/', (req, res) => {
  console.log("Rispondo richiesta: /");
  res.json("Hello from node server!");
});

app.post('/login/', (req, res, next) => {
  console.log("Rispondo richiesta:'/login/");


  var email = req.body.email;
  var user_password = req.body.password;

  var login_query = "SELECT * FROM users WHERE email = \'" + email +"\';";
  con.query(login_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.json("500");
      console.log('[PostgreSQL ERROR]', err);
    }else{
      if(result.rowCount > 0){
        var user_type = result.rows[0].user_type;
        var user_id = result.rows[0].user_id;
        var name = result.rows[0].name;
        var lastname = result.rows[0].lastname;
        var email = result.rows[0].email;
        var birthdate = result.rows[0].birthdate;
        var db_password = result.rows[0].password;



        if(db_password == user_password){
          var to_res = {
            "type": user_type,
            "id":user_id,
            "name":name, "lastName": lastname,
            "email": email,
            "birthDate": birthdate}


          res.statusCode=200;
          res.json(to_res);
        } else{
          res.statusCode=401;
          res.json("401");
          console.log('[LOGIN ERROR: password sbagliata]');
        }

      } else{
        res.statusCode=404;
        res.json("404");
        console.log('[LOGIN ERROR: email sbagliata o non esistente]');
      }
    }
  });
});

app.post('/insert_notifications/', (req, res, next) => {
  console.log("Rispondo richiesta:'/notifications/");
  var to_check = req.body;

  var notification_type = to_check.notification_type;
  var text = to_check.text;
  var user_id = to_check.user_id;

  var insert_notification_query = "INSERT INTO notifications (notification_type, text, user_id) VALUES ('"+notification_type+"', '"+text+"','"+user_id+"');";
  con.query(insert_notification_query, function(err, result, fields){
    if(err){
      res.json("500");
      console.log('[PostgreSQL ERROR]', err);
    }else{
      res.json("200");
    }
  });
});

app.get('/get_notifications/:user_id', (req, res) => {
  console.log("Rispondo richiesta: /get/notifications/:user_id");
  var user_id = req.params.user_id;
  var query = "SELECT * FROM notifications WHERE user_id = '"+ user_id +"';";
  con.query(query, (err, result) => {
    if (err) {
      res.json("500");
      console.log('[PostgreSQL ERROR]', err);
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.json("404");
        console.log('[No notifications avaiable]');
      } else {
        res.json(data);
      }
    }
  });
});

app.get('/get_user_data/:email', (req, res) => {
  console.log("Rispondo richiesta: /get_user_data/:email");
  var email = req.params.email;
  var userID_query = "SELECT user_id, user_type FROM users WHERE email = \'" + email +"\';";
  con.query(userID_query, function(err, result, fields){
    if(err){
      res.json("-1");
      console.log('[PostgreSQL ERROR]', err);
    }else {
      if(result.rowCount > 0){
        var user_id = result.rows[0].user_id;
        var user_type = result.rows[0].user_type;
        var response = user_id+","+user_type;
        res.json(response);
      } else{
        res.json("-1");
        console.log('[Register ERROR]', err);
      }
    }
  });
})


///////////////////////////////////////
///                                 ///
///           CUSTOMERS             ///
///                                 ///
///////////////////////////////////////

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




///////////////////////////////////////
///                                 ///
///              GYM                ///
///                                 ///
///////////////////////////////////////

app.post('/gym/register/', (req, res, next) => {
  console.log("Rispondo richiesta:'/gym/register/");
  var to_add = req.body;

  //USERS
  var name = to_add.name;
  var lastname = to_add.lastname;
  var birthdate = to_add.birthdate;
  var email = to_add.email;
  var password = to_add.password;
  var user_type = to_add.user_type;
  //GYMS
  var vat_number = to_add.vat_number;
  var gym_name = to_add.gym_name;
  var gym_address = to_add.gym_address;
  var zip_code = to_add.zip_code;
  var pool = to_add.pool;
  var box_ring = to_add.box_ring;
  var aerobics = to_add.aerobics;
  var spa = to_add.spa;
  var wifi = to_add.wifi;
  var parking_area = to_add.parking_area;
  var personal_trainer_service = to_add.personal_trainer_service;
  var nutritionist_service = to_add.nutritionist_service;
  var impedance_balance = to_add.impedance_balance;
  var courses = to_add.courses;
  var showers = to_add.showers;

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
                  var user_query = "INSERT INTO gyms (user_id, vat_number, gym_name, gym_address ,zip_code ,pool, box_ring, aerobics, spa, wifi, parking_area, personal_trainer_service, nutritionist_service, impedance_balance, courses, showers) VALUES ('"+user_id+"','"+vat_number+"','"+gym_name+"','"+gym_address+"','"+zip_code+"','"+pool+"','"+box_ring+"','"+aerobics+"','"+spa+"','"+wifi+"','"+parking_area+"','"+personal_trainer_service+"','"+nutritionist_service+"','"+impedance_balance+"','"+courses+"','"+showers+"');";
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



///////////////////////////////////////
///                                 ///
///            TRAINER              ///
///                                 ///
///////////////////////////////////////

app.post('/trainer/register/', (req, res, next) => {
  console.log("Rispondo richiesta:'/trainer/register/");
  var to_add = req.body;

  var name = to_add.name;
  var lastname = to_add.lastname;
  var birthdate = to_add.birthdate;
  var email = to_add.email;
  var password = to_add.password;
  var user_type = to_add.user_type;

  var qualification = to_add.qualification;
  var fiscal_code = to_add.fiscal_code;

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
                  var user_query = "INSERT INTO personal_trainers (user_id, qualification, fiscal_code) VALUES ('"+user_id+"','"+qualification+"','"+fiscal_code+"');";
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



///////////////////////////////////////
///                                 ///
///         NUTRITIONIST            ///
///                                 ///
///////////////////////////////////////

app.post('/nutritionist/register/', (req, res, next) => {
  console.log("Rispondo richiesta:'/nutritionist/register/");
  var to_add = req.body;

  var name = to_add.name;
  var lastname = to_add.lastname;
  var birthdate = to_add.birthdate;
  var email = to_add.email;
  var password = to_add.password;
  var user_type = to_add.user_type;

  var qualification = to_add.qualification;
  var fiscal_code = to_add.fiscal_code;

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
                  var user_query = "INSERT INTO nutritionists (user_id, qualification, fiscal_code) VALUES ('"+user_id+"','"+qualification+"','"+fiscal_code+"');";
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

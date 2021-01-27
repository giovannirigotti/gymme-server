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
  res.end();
});

//////   LOGIN E REGISTRAZIONE    ////

app.post('/login/', (req, res, next) => {
  console.log("Rispondo richiesta:'/login/");

  var email = req.body.email;
  var user_password = req.body.password;

  var login_query = "SELECT * FROM users WHERE email = \'" + email +"\';";
  con.query(login_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
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
            "name":name,
            "lastName": lastname,
            "email": email,
            "birthDate": birthdate}

          res.statusCode=200;
          res.json(to_res);
          res.end();
          console.log('[LOGIN OK]');
        } else{
          res.statusCode=401;
          console.log('[LOGIN ERROR: password sbagliata]');
          res.end();
        }

      } else{
        res.statusCode=404;
        console.log('[LOGIN ERROR: email sbagliata o non esistente]');
        res.end();
      }
    }
  });
});

app.post('/register/user/', (req, res, next) => {
  console.log("Rispondo richiesta:'/register/user/");
  var to_add = req.body;

  var name = to_add.name;
  var lastname = to_add.lastname;
  var birthdate = to_add.birthdate;
  var email = to_add.email;
  var password = to_add.password;
  var user_type = to_add.user_type;

  //INSERISCO DATI NELLA TABELLO users
  var register_query = "INSERT INTO users (name, lastname, birthdate, email, password, user_type) VALUES ('"+name+"', '"+lastname+"', TO_DATE('"+birthdate+"', 'DD/MM/YYYY'), '"+email+"', '"+password+"', '"+user_type+"');";
  con.query(register_query, function(err, result, fields){

    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      res.statusCode=200;
      res.end();
      console.log('[User inserito]');
    }
  });
})

//////   GESTIONE NOTIFICHE    ////

app.post('/insert_notifications/', (req, res, next) => {
  console.log("Rispondo richiesta:'/insert_notifications/");
  var to_check = req.body;

  var notification_type = to_check.notification_type;
  var text = to_check.text;
  var user_id = to_check.user_id;

  var insert_notification_query = "INSERT INTO notifications (notification_type, text, user_id) VALUES ('"+notification_type+"', '"+text+"','"+user_id+"');";
  con.query(insert_notification_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else{
      res.statusCode=200;
      res.end();
    }
  });
});

app.get('/update_all_notifications/:user_id', (req, res) => {
  console.log("Rispondo richiesta: /update_all_notifications/:user_id");
  var user_id = req.params.user_id;
  // modifico a -1 il valore di notifications_type per impostare le notifiche come lette
  var query = "UPDATE notifications SET notification_type = -1 where user_id ='"+ user_id +"' AND notification_type != -1;";
  con.query(query, (err, result) => {
    if (err) {
      res.statusCode=500;
      console.log('[PostgreSQL ERROR]', err);
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode=404;
        res.end();
        console.log('[No notifications avaiable]');
      } else {
        res.statusCode=200;
        res.json(data);
        res.end();
      }
    }
  });
});

app.get('/update_a_notification/:id', (req, res) => {
  console.log("Rispondo richiesta: /update_a_notification/:notification_id");
  var id = req.params.id;
  // modifico a -1 il valore di notifications_type per impostare le notifiche come lette
  var query = "UPDATE notifications SET notification_type = -1 where notification_id ='"+ id +"' AND notification_type != -1;";
  con.query(query, (err, result) => {
    if (err) {
      res.statusCode=500;
      console.log('[PostgreSQL ERROR]', err);
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode=404;
        res.end();
        console.log('[No notifications avaiable]');
      } else {
        res.statusCode=200;
        res.json(data);
        res.end();
      }
    }
  });
});


app.get('/get_notifications/:user_id', (req, res) => {
  console.log("Rispondo richiesta: /get_notifications/:user_id");
  var user_id = req.params.user_id;
  var query = "SELECT * FROM notifications WHERE user_id = '"+ user_id +"' AND notification_type != -1;";
  con.query(query, (err, result) => {
    if (err) {
      res.statusCode=500;
      console.log('[PostgreSQL ERROR]', err);
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode=404;
        res.end();
        console.log('[No notifications avaiable]');
      } else {
        res.statusCode=200;
        res.json(data);
        res.end();
      }
    }
  });
});


//////   GET USER DATA    ////

app.get('/get_user_data/:email', (req, res) => {
  console.log("Rispondo richiesta: /get_user_data/:email");
  var email = req.params.email;
  var userID_query = "SELECT user_id, user_type FROM users WHERE email = \'" + email +"\';";
  con.query(userID_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      if(result.rowCount > 0){
        var user_id = result.rows[0].user_id;
        var user_type = result.rows[0].user_type;
        res.statusCode=200;
        res.json(
          {
            "user_id": user_id,
            "user_type": user_type
          }
        );
        res.end();
      } else{
        res.statusCode=404;
        res.end();
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

app.post('/register/customer/', (req, res, next) => {
  console.log("Rispondo richiesta:'/register/customer/");
  var to_add = req.body;

  var user_id = to_add.user_id;
  var height = to_add.height;
  var diseases = to_add.diseases;
  var allergies = to_add.allergies;

  var user_query = "INSERT INTO customers (user_id, height, diseases, allergies) VALUES ('"+user_id+"','"+height+"','"+diseases+"','"+allergies+"');";
  con.query(user_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      //SUCCESS FINALE
      res.statusCode=200;
      res.end();
      console.log('[Cunsomer aggiunto]');
    }
  });
})



///////////////////////////////////////
///                                 ///
///              GYM                ///
///                                 ///
///////////////////////////////////////

app.post('/register/gym/', (req, res, next) => {
  console.log("Rispondo richiesta:'/register/gym/");
  var to_add = req.body;

  var user_id = to_add.user_id;
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

  var user_query = "INSERT INTO gyms (user_id, vat_number, gym_name, gym_address ,zip_code ,pool, box_ring, aerobics, spa, wifi, parking_area, personal_trainer_service, nutritionist_service, impedance_balance, courses, showers) VALUES ('"+user_id+"','"+vat_number+"','"+gym_name+"','"+gym_address+"','"+zip_code+"','"+pool+"','"+box_ring+"','"+aerobics+"','"+spa+"','"+wifi+"','"+parking_area+"','"+personal_trainer_service+"','"+nutritionist_service+"','"+impedance_balance+"','"+courses+"','"+showers+"');";
  con.query(user_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      //SUCCESS FINALE
      res.statusCode=200;
      res.end();
      console.log('[Gym aggiunta]');
    }
  });
})



///////////////////////////////////////
///                                 ///
///            TRAINER              ///
///                                 ///
///////////////////////////////////////

app.post('/register/trainer/', (req, res, next) => {
  console.log("Rispondo richiesta:'/register/trainer/");
  var to_add = req.body;

  var user_id = to_add.user_id;
  var qualification = to_add.qualification;
  var fiscal_code = to_add.fiscal_code;

  var user_query = "INSERT INTO personal_trainers (user_id, qualification, fiscal_code) VALUES ('"+user_id+"','"+qualification+"','"+fiscal_code+"');";
  con.query(user_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      //SUCCESS FINALE
      res.statusCode=200;
      res.end();
      console.log('[Trainer aggiunto]');
    }
  });
})



///////////////////////////////////////
///                                 ///
///         NUTRITIONIST            ///
///                                 ///
///////////////////////////////////////


app.post('/register/nutritionist/', (req, res, next) => {
  console.log("Rispondo richiesta:'/register/nutritionist/");
  var to_add = req.body;

  var user_id = to_add.user_id;
  var qualification = to_add.qualification;
  var fiscal_code = to_add.fiscal_code;

  var user_query = "INSERT INTO nutritionists (user_id, qualification, fiscal_code) VALUES ('"+user_id+"','"+qualification+"','"+fiscal_code+"');";
  con.query(user_query, function(err, result, fields){
    if(err){
      res.statusCode=500;
      res.end();
      console.log('[PostgreSQL ERROR]', err);
    }else {
      //SUCCESS FINALE
      res.statusCode=200;
      res.end();
      console.log('[Nutrizionista aggiunto]');
    }
  });
})

var express = require('express');
var bodyParser = require('body-parser');
var {
    Pool,
    Client
} = require('pg');

const hostname = '127.0.0.1';
const port = 4000;

/////////////// Connessione al database.
const con = new Client({
    user: "postgres",
    password: "postgresql",
    host: '127.0.0.1',
    port: "5432",
    database: "gymme-db",
    multipleStatements: true
});

con.connect()
    .then(() => console.log("Connected successfuly"))
    .catch(err => console.log(err));


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

    var login_query = "SELECT * FROM users WHERE email = \'" + email + "\';";
    con.query(login_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var user_type = result.rows[0].user_type;
                var user_id = result.rows[0].user_id;
                var name = result.rows[0].name;
                var lastname = result.rows[0].lastname;
                var email = result.rows[0].email;
                var birthdate = result.rows[0].birthdate;
                var db_password = result.rows[0].password;

                if (db_password == user_password) {
                    var to_res = {
                        "type": user_type,
                        "id": user_id,
                        "name": name,
                        "lastName": lastname,
                        "email": email,
                        "birthDate": birthdate
                    }

                    res.statusCode = 200;
                    res.json(to_res);
                    res.end();
                    console.log('[LOGIN OK]');
                } else {
                    res.statusCode = 401;
                    console.log('[LOGIN ERROR: password sbagliata]');
                    res.end();
                }

            } else {
                res.statusCode = 404;
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
    var register_query = "INSERT INTO users (name, lastname, birthdate, email, password, user_type) VALUES ('" + name + "', '" + lastname + "', TO_DATE('" + birthdate + "', 'DD/MM/YYYY'), '" + email + "', '" + password + "', '" + user_type + "');";
    con.query(register_query, function (err, result, fields) {

        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
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

    var insert_notification_query = "INSERT INTO notifications (notification_type, text, user_id) VALUES ('" + notification_type + "', '" + text + "','" + user_id + "');";
    con.query(insert_notification_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
        }
    });
});

app.post('/update_all_notifications/', (req, res) => {
    console.log("Rispondo richiesta: /update_all_notifications/");
    var to_check = req.body;
    var user_id = to_check.user_id;
    // modifico a -1 il valore di notifications_type per impostare le notifiche come lette
    var query = "UPDATE notifications SET notification_type = -1 where user_id ='" + user_id + "' AND notification_type != -1;";
    con.query(query, (err, result) => {
        if (err) {
            res.statusCode = 500;
            console.log('[PostgreSQL ERROR]', err);
        } else {
            var data = result.rows;
            if (data.length == 0) {
                res.statusCode = 404;
                res.end();
                console.log('[No notifications avaiable]');
            } else {
                res.statusCode = 200;
                res.json(data);
                res.end();
            }
        }
    });
});

app.get('/update_a_notification/:notification_id', (req, res) => {
    console.log("Rispondo richiesta: /update_a_notification/:notification_id");
    var id = req.params.notification_id;
    console.log(id);
    // modifico a -1 il valore di notifications_type per impostare le notifiche come lette
    var query = "UPDATE notifications SET notification_type = -1 where notification_id ='" + id + "';";
    con.query(query, (err, result) => {
        if (err) {
            res.statusCode = 500;
            console.log('[PostgreSQL ERROR]', err);
        } else {

            console.log('[Success update notification]');

            res.statusCode = 200;

            res.end();

        }
    });
});

app.get('/get_notifications/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /get_notifications/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM notifications WHERE user_id = '" + user_id + "' AND notification_type != -1;";
    con.query(query, (err, result) => {
        if (err) {
            res.statusCode = 500;
            console.log('[PostgreSQL ERROR]', err);
        } else {
            var data = result.rows;
            if (data.length == 0) {
                res.statusCode = 404;
                res.end();
                console.log('[No notifications avaiable]');
            } else {
                res.statusCode = 200;
                res.json(data);
                res.end();
            }
        }
    });
});


//////   MENEGE USER DATA    ////

app.get('/get_user_data/:email', (req, res) => {
    console.log("Rispondo richiesta: /get_user_data/:email");
    var email = req.params.email;
    var userID_query = "SELECT user_id, user_type FROM users WHERE email = \'" + email + "\';";
    con.query(userID_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var user_id = result.rows[0].user_id;
                var user_type = result.rows[0].user_type;
                res.statusCode = 200;
                res.json({
                    "user_id": user_id,
                    "user_type": user_type
                });
                res.end();
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/user/update_password/', (req, res, next) => {
    console.log("Rispondo richiesta:'/user/update_password/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var old_password = to_add.old_password;
    var new_password = to_add.new_password;

    var get_old_password = "SELECT password FROM users WHERE user_id = '" + user_id + "';";
    con.query(get_old_password, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var password_to_check = result.rows[0].password;
                if (password_to_check == old_password) {
                    var change_password = "UPDATE users SET password = '" + new_password + "' WHERE user_id ='" + user_id + "';";
                    con.query(change_password, function (err, result, fields) {
                        if (err) {
                            res.statusCode = 500;
                            res.end();
                            console.log('[PostgreSQL ERROR]', err);
                        } else {
                            res.statusCode = 200;
                            res.end();
                            console.log('[PASSWORD AGGIORNATA]');
                        }
                    });
                } else {
                    res.statusCode = 403;
                    res.end();
                    console.log('[LA VECCHIA PASSWORD NON CORRISPONDE]', err);
                }
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }

        }
    });
})

app.post('/user/update_email/', (req, res, next) => {
    console.log("Rispondo richiesta:'/user/update_email/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var email = to_add.email;

    var check_email = "SELECT user_id FROM users WHERE email = '" + email + "';";
    con.query(check_email, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var user_id_to_check = result.rows[0].user_id;
                if (user_id_to_check == user_id) {
                    res.statusCode = 200;
                    res.end();
                    console.log('[EMAIL INVARIATA]');
                } else {
                    res.statusCode = 403;
                    res.end();
                    console.log('[EMAIL GIA ESISTENTE]');
                }
            } else {
                var change_email = "UPDATE users SET email = '" + email + "' WHERE user_id ='" + user_id + "';";
                con.query(change_email, function (err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[PostgreSQL ERROR]', err);
                    } else {
                        res.statusCode = 200;
                        res.end();
                        console.log('[EMAIL AGGIORNATA]');
                    }
                });
            }
        }
    });
})

app.get('/user/get_all_data/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /user/get_all_data/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM users WHERE user_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var name = result.rows[0].name;
                var lastname = result.rows[0].lastname;
                var birthdate = result.rows[0].birthdate;
                var email = result.rows[0].email;
                res.statusCode = 200;
                res.json({
                    "name": name,
                    "lastname": lastname,
                    "email": email,
                    "birthdate": birthdate
                });
                res.end();
                console.log('[GET USERS DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
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

    var user_query = "INSERT INTO customers (user_id, height, diseases, allergies) VALUES ('" + user_id + "','" + height + "','" + diseases + "','" + allergies + "');";
    con.query(user_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            //SUCCESS FINALE
            res.statusCode = 200;
            res.end();
            console.log('[Cunsomer aggiunto]');
        }
    });
})

app.get('/customer/get_all_data/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /user/get_all_data/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM customers WHERE user_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var height = result.rows[0].height;
                var diseases = result.rows[0].diseases;
                var allergies = result.rows[0].allergies;
                res.statusCode = 200;
                res.json({
                    "height": height,
                    "diseases": diseases,
                    "allergies": allergies
                });
                res.end();
                console.log('[GET CUSTOMERS DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/customer/update_diseases/', (req, res, next) => {
    console.log("Rispondo richiesta:/customer/update_diseases/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var diseases = to_add.diseases;

    var change_query = "UPDATE customers SET diseases = '" + diseases + "' WHERE user_id ='" + user_id + "';";
    con.query(change_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[DISTURBI AGGIORNATI]');
        }
    });
})

app.get('/customer/get_gym_customers/:user_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/get_gym_customers/:user_id");
    var user_id_util = req.params.user_id;
    var query = "select G.* from gyms as G join gym_customers as GC on G.user_id = GC.gym_id where GC.user_id ='"+user_id_util+"';";
    con.query(query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];


                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var vat_number = result.rows[i].vat_number;
                    var gym_name = result.rows[i].gym_name;
                    var gym_address = result.rows[i].gym_address;
                    var zip_code = result.rows[i].zip_code;
                    var pool = result.rows[i].pool;
					var box_ring = result.rows[i].box_ring;
                    var aerobics = result.rows[i].aerobics;
                    var spa = result.rows[i].spa;
                    var wifi = result.rows[i].wifi;
                    var parking_area = result.rows[i].parking_area;
                    var personal_trainer_service = result.rows[i].personal_trainer_service;
					var nutritionist_service = result.rows[i].nutritionist_service;
                    var impedance_balance = result.rows[i].impedance_balance;
                    var courses = result.rows[i].courses;
                    var showers = result.rows[i].showers;

                    var tmp = {
                        "user_id": user_id,
                        "vat_number": vat_number,
                        "gym_name": gym_name,
                        "gym_address": gym_address,
                        "zip_code": zip_code,
                        "pool": pool,
						"box_ring": box_ring,
                        "aerobics": aerobics,
                        "spa": spa,
                        "wifi": wifi,
                        "parking_area": parking_area,
                        "personal_trainer_service": personal_trainer_service,
						"nutritionist_service": nutritionist_service,
                        "impedance_balance": impedance_balance,
                        "courses": courses,
                        "showers": showers,

                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.get('/customer/get_disponible_gym_customers/:user_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/get_gym_customers/:user_id");
    var user_id = req.params.user_id;
    var query = "select G1.user_id,  G1.vat_number, G1.gym_name, G1.gym_address, G1.zip_code, G1.pool, G1.box_ring, G1.aerobics, G1.spa, G1.wifi, G1.parking_area, G1.personal_trainer_service,  G1.nutritionist_service, G1.impedance_balance, G1.courses, G1.showers from gyms as G1 except select G.user_id,  G.vat_number, G.gym_name, G.gym_address, G.zip_code, G.pool, G.box_ring, G.aerobics, G.spa, G.wifi, G.parking_area, G.personal_trainer_service, G.nutritionist_service, G.impedance_balance, G.courses, G.showers from gyms as G join gym_customers as GC on G.user_id = GC.gym_id where GC.user_id = '"+user_id+"';";
    con.query(query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];


                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var vat_number = result.rows[i].vat_number;
                    var gym_name = result.rows[i].gym_name;
                    var gym_address = result.rows[i].gym_address;
                    var zip_code = result.rows[i].zip_code;
                    var pool = result.rows[i].pool;
					var box_ring = result.rows[i].box_ring;
                    var aerobics = result.rows[i].aerobics;
                    var spa = result.rows[i].spa;
                    var wifi = result.rows[i].wifi;
                    var parking_area = result.rows[i].parking_area;
                    var personal_trainer_service = result.rows[i].personal_trainer_service;
					var nutritionist_service = result.rows[i].nutritionist_service;
                    var impedance_balance = result.rows[i].impedance_balance;
                    var courses = result.rows[i].courses;
                    var showers = result.rows[i].showers;

                    var tmp = {
                        "user_id": user_id,
                        "vat_number": vat_number,
                        "gym_name": gym_name,
                        "gym_address": gym_address,
                        "zip_code": zip_code,
                        "pool": pool,
						"box_ring": box_ring,
                        "aerobics": aerobics,
                        "spa": spa,
                        "wifi": wifi,
                        "parking_area": parking_area,
                        "personal_trainer_service": personal_trainer_service,
						"nutritionist_service": nutritionist_service,
                        "impedance_balance": impedance_balance,
                        "courses": courses,
                        "showers": showers,

                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/customer/update_allergies/', (req, res, next) => {
    console.log("Rispondo richiesta:/customer/update_allergies/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var allergies = to_add.allergies;

    var change_query = "UPDATE customers SET allergies = '" + allergies + "' WHERE user_id ='" + user_id + "';";
    con.query(change_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[ALLERGIE AGGIORNATI]');
        }
    });
})

app.post('/customer/inscription/', (req, res, next) => {
    console.log("Rispondo richiesta:/customer/inscription/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var gym_id = to_add.gym_id;

    var change_query = "INSERT INTO gym_customers VALUES ( '" + user_id + "','" + gym_id + "');";
    con.query(change_query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[CUSTOMER INSERITO]');
        }
    });
})


app.get('/customer/get_course_customers/:user_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/get_course_customers/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT C.*, T.name, T.lastname FROM courses C join course_users CU on CU.course_id = C.course_id JOIN users T ON T.user_id = C.trainer_id  WHERE CU.user_id = '"+user_id+"';";


    con.query(query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];


                for (var i = 0; i < result.rowCount; i++) {
                    var course_id = result.rows[i].course_id;
                    var gym_id = result.rows[i].gym_id;
                    var trainer_id = result.rows[i].trainer_id;
                    var description = result.rows[i].description;
                    var title = result.rows[i].title;
					var category = result.rows[i].category;
                    var start_date = result.rows[i].start_date;
                    var end_date = result.rows[i].end_date;
                    var max_persons = result.rows[i].max_persons;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;



                    var tmp = {
                        "course_id": course_id,
                        "gym_id": gym_id,
                        "description": description,
                        "title": title,
                        "category": category,
                        "start_date": start_date,
						"end_date": end_date,
                        "max_persons": max_persons,
                        "name": name,
                        "lastname": lastname,
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})


app.get('/customer/get_disponible_course_customers/:user_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/get_course_customers/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT C.*, T.name, T.lastname FROM courses C  JOIN gyms G on G.user_id = C.gym_id  join gym_customers U on G.user_id = U.gym_id JOIN users T ON T.user_id = C.trainer_id  WHERE U.user_id = '"+user_id+"' except SELECT C.*, T.name, T.lastname FROM courses C join course_users CU on CU.course_id = C.course_id JOIN users T ON T.user_id = C.trainer_id WHERE CU.user_id = '"+user_id+"';";


    con.query(query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];


                for (var i = 0; i < result.rowCount; i++) {
                    var course_id = result.rows[i].course_id;
                    var gym_id = result.rows[i].gym_id;
                    var trainer_id = result.rows[i].trainer_id;
                    var description = result.rows[i].description;
                    var title = result.rows[i].title;
					var category = result.rows[i].category;
                    var start_date = result.rows[i].start_date;
                    var end_date = result.rows[i].end_date;
                    var max_persons = result.rows[i].max_persons;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;


                    var tmp = {
                        "course_id": course_id,
                        "gym_id": gym_id,
                        "description": description,
                        "title": title,
                        "category": category,
                        "start_date": start_date,
						"end_date": end_date,
                        "max_persons": max_persons,
                        "name": name,
                        "lastname": lastname,
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/customer/inscription_course/', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/inscription_course/");
    var to_add = req.body;

    var course_id = to_add.course_id;
    var user_id = to_add.user_id;

    var hire_query = "INSERT INTO course_users VALUES(" + user_id + "," + course_id + ");";
    con.query(hire_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore inserimento!]', err)
        } else {
            console.log('[Iscrizione effettuata]');
            res.statusCode = 200;
            res.end();
        }

    });
});

app.post('/customer/disinscription_course/', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/disinscription_course/");
    var to_add = req.body;

    var course_id = to_add.course_id;
    var user_id = to_add.user_id;

    var delete_query = "DELETE FROM course_users WHERE course_id = '" + course_id + "' AND user_id = '" + user_id + "';";
    con.query(delete_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel cancellare il corso!]')
        } else {
            console.log('[Disiscrizione effettuata]');
            res.statusCode = 200;
            res.end();
        }

    });
});


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

    var hours_array = [
        to_add.opening_monday,
        to_add.closing_monday,
        to_add.opening_tuesday,
        to_add.closing_tuesday,
        to_add.opening_wednesday,
        to_add.closing_wednesday,
        to_add.opening_thursday,
        to_add.closing_thursday,
        to_add.opening_friday,
        to_add.closing_friday,
        to_add.opening_saturday,
        to_add.closing_saturday,
        to_add.opening_sunday,
        to_add.closing_sunday
    ];


    var user_query = "INSERT INTO gyms (user_id, vat_number, gym_name, gym_address ,zip_code ,pool, box_ring, aerobics, " +
        "spa, wifi, parking_area, personal_trainer_service, nutritionist_service, impedance_balance, courses, showers) VALUES" +
        " ('" + user_id + "','" + vat_number + "','" + gym_name + "','" + gym_address + "','" + zip_code + "','" + pool + "','" + box_ring + "','" + aerobics + "','" + spa + "','" + wifi + "','" + parking_area + "','" + personal_trainer_service + "','" + nutritionist_service + "','" + impedance_balance + "','" + courses + "','" + showers + "');";
    con.query(user_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel registrare la palestra!]')
        } else {
            res_data = true;
            console.log('[Dati palestra aggiunti]');
            for (i = 0; i < 14; i = i + 2) {
                var hours_query = "INSERT INTO gym_hours (gym_id, day, open, close) VALUES ('" + user_id + "','" +
                    Number(i / 2 + 1) + "','" + hours_array[i] + "','" + hours_array[i + 1] + "');";

                con.query(hours_query, function (err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[Errore nel registrare gli orari della palestra!]' + err)
                    } else {
                        res.statusCode = 200;
                        res.end();
                        console.log('[Orario aggiunto]');
                    }
                });
            }
        }

    });
});

app.get('/gym/get_all_data/:gym_id', (req, res) => {
    console.log("Rispondo richiesta: /gym/get_all_data/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "SELECT * FROM gyms WHERE user_id = \'" + gym_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var user_id = result.rows[0].user_id;
                var vat_number = result.rows[0].vat_number;
                var gym_name = result.rows[0].gym_name;
                var gym_address = result.rows[0].gym_address;
                var zip_code = result.rows[0].zip_code;
                var pool = result.rows[0].pool;
                var box_ring = result.rows[0].box_ring;
                var aerobics = result.rows[0].aerobics;
                var spa = result.rows[0].spa;
                var wifi = result.rows[0].wifi;
                var parking_area = result.rows[0].parking_area;
                var personal_trainer_service = result.rows[0].personal_trainer_service;
                var nutritionist_service = result.rows[0].nutritionist_service;
                var impedance_balance = result.rows[0].impedance_balance;
                var courses = result.rows[0].courses;
                var showers = result.rows[0].showers;

                res.statusCode = 200;
                res.json({
                    "user_id": user_id,
                    "vat_number": vat_number,
                    "gym_name": gym_name,
                    "gym_address": gym_address,
                    "zip_code": zip_code,
                    "pool": pool,
                    "box_ring": box_ring,
                    "aerobics": aerobics,
                    "spa": spa,
                    "wifi": wifi,
                    "parking_area": parking_area,
                    "personal_trainer_service": personal_trainer_service,
                    "nutritionist_service": nutritionist_service,
                    "impedance_balance": impedance_balance,
                    "courses": courses,
                    "showers": showers
                });
                res.end();
                console.log('[GET GYM DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/gym/update_hours/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/update_hours/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;

    var hours_array = [
        to_add.opening_monday,
        to_add.closing_monday,
        to_add.opening_tuesday,
        to_add.closing_tuesday,
        to_add.opening_wednesday,
        to_add.closing_wednesday,
        to_add.opening_thursday,
        to_add.closing_thursday,
        to_add.opening_friday,
        to_add.closing_friday,
        to_add.opening_saturday,
        to_add.closing_saturday,
        to_add.opening_sunday,
        to_add.closing_sunday
    ];

    console.log("id" + gym_id);
    console.log("monday open" + hours_array[0]);


    var delete_query = "DELETE FROM gym_hours WHERE gym_id = '" + gym_id + "';";
    con.query(delete_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel cancellare gli orari della palestra!]')
        } else {
            res_data = true;
            console.log('[Orari palestra canellati]');
            for (i = 0; i < 14; i = i + 2) {
                var hours_query = "INSERT INTO gym_hours (gym_id, day, open, close) VALUES ('" + gym_id + "','" +
                    Number(i / 2 + 1) + "','" + hours_array[i] + "','" + hours_array[i + 1] + "');";

                con.query(hours_query, function (err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log("[Errore nell'aggiornare gli orari della palestra!]" + err)
                    } else {
                        res.statusCode = 200;
                        res.end();
                        console.log('[Orario aggiornato]');
                    }
                });
            }
        }

    });
});

app.get('/gym/get_hours/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_hours/:gym_id");
    var gym_id = req.params.gym_id;
    var hours_query = "SELECT * FROM gym_hours WHERE gym_id = \'" + gym_id + "\';";
    con.query(hours_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var gym_id = result.rows[i].gym_id;
                    var day = result.rows[i].day;
                    var open = result.rows[i].open;
                    var close = result.rows[i].close;

                    var tmp = {
                        "gym_id": gym_id,
                        "day": day,
                        "open": open,
                        "close": close
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET HOURS SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR]', err);
            }
        }
    });
})

app.get('/gym/get_gym_trainers/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_gym_trainers/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "SELECT T.user_id, name, lastname, email, qualification, fiscal_code FROM gym_trainers as T JOIN " +
        "personal_trainers AS G on T.user_id = G.user_id JOIN users AS U ON G.user_id = U.user_id WHERE gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var email = result.rows[i].email;
                    var qualification = result.rows[i].qualification;
                    var fiscal_code = result.rows[i].fiscal_code;

                    var tmp = {
                        "user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "email": email,
                        "qualification": qualification,
                        "fiscal_code": fiscal_code
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_trainers SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/gym/hire_trainer/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/hire_trainer/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var user_id = to_add.user_id;

    var hire_query = "INSERT INTO gym_trainers VALUES(" + user_id + "," + gym_id + ");";
    con.query(hire_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore inserimento!]', err)
        } else {
            console.log('[Trainer assunto]');
            res.statusCode = 200;
            res.end();
        }

    });
});

app.post('/gym/dismiss_trainer/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/dismiss_trainer/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var user_id = to_add.user_id;

    var delete_query = "DELETE FROM gym_trainers WHERE gym_id = '" + gym_id + "' AND user_id = '" + user_id + "';";
    con.query(delete_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel cancellare il collegamento!]')
        } else {
            console.log('[Trainer licenziato]');
            res.statusCode = 200;
            res.end();
        }

    });
});

app.post('/gym/hire_nutritionist/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/hire_nutritionist/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var user_id = to_add.user_id;

    var hire_query = "INSERT INTO gym_nutritionists VALUES(" + user_id + "," + gym_id + ");";
    con.query(hire_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore inserimento!]', err)
        } else {
            console.log('[Nutrizionista assunto]');
            res.statusCode = 200;
            res.end();
        }

    });
});

app.post('/gym/dismiss_nutritionist/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/dismiss_nutritionist/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var user_id = to_add.user_id;

    var delete_query = "DELETE FROM gym_nutritionists WHERE gym_id = '" + gym_id + "' AND user_id = '" + user_id + "';";
    con.query(delete_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel cancellare il collegamento!]')
        } else {
            console.log('[Nutritionist licenziato]');
            res.statusCode = 200;
            res.end();
        }

    });
});

app.get('/gym/get_gym_nutritionists/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_gym_nutritionists/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "SELECT T.user_id, name, lastname, email, qualification, fiscal_code FROM gym_nutritionists as T JOIN nutritionists " +
        "AS G on T.user_id = G.user_id JOIN users AS U ON G.user_id = U.user_id WHERE gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var email = result.rows[i].email;
                    var qualification = result.rows[i].qualification;
                    var fiscal_code = result.rows[i].fiscal_code;

                    var tmp = {
                        "user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "email": email,
                        "qualification": qualification,
                        "fiscal_code": fiscal_code
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_trainers SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.get('/gym/get_boolean_data/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /gym/get_boolean_data/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT pool, box_ring, aerobics, spa, wifi, parking_area, personal_trainer_service, nutritionist_service, " +
        "impedance_balance, courses, showers FROM gyms WHERE user_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var pool = result.rows[0].pool;
                var box_ring = result.rows[0].box_ring;
                var aerobics = result.rows[0].aerobics;
                var spa = result.rows[0].spa;
                var wifi = result.rows[0].wifi;
                var parking_area = result.rows[0].parking_area;
                var personal_trainer_service = result.rows[0].personal_trainer_service;
                var nutritionist_service = result.rows[0].nutritionist_service;
                var impedance_balance = result.rows[0].impedance_balance;
                var courses = result.rows[0].courses;
                var showers = result.rows[0].showers;
                res.statusCode = 200;
                res.json({
                    "pool": pool,
                    "box_ring": box_ring,
                    "aerobics": aerobics,
                    "spa": spa,
                    "wifi": wifi,
                    "parking_area": parking_area,
                    "personal_trainer_service": personal_trainer_service,
                    "nutritionist_service": nutritionist_service,
                    "impedance_balance": impedance_balance,
                    "courses": courses,
                    "showers": showers
                });
                res.end();
                console.log('[GET GYM DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/gym/set_hours/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/set_hours/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var day = to_add.day;
    var open = to_add.open;
    var close = to_add.close;

    var set_query = "INSERT INTO gym_hours (gym_id, day, open, close) VALUES ('" + gym_id + "','" + day + "','" + open + "','" + close + "');";
    con.query(set_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            //SUCCESS FINALE
            res.statusCode = 200;
            res.end();
            console.log('[Orario aggiunto]');
        }
    });
})

app.post('/gym/update_boolean_data/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/update_boolean_data/");
    var to_add = req.body;

    var user_id = to_add.user_id;
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

    var change_query = "UPDATE gyms SET pool = '" + pool + "', box_ring = '" + box_ring + "', aerobics = '" + aerobics + "', spa = '" + spa + "', " +
        "wifi = '" + wifi + "', parking_area = '" + parking_area + "', personal_trainer_service = '" + personal_trainer_service + "'," +
        " nutritionist_service = '" + nutritionist_service + "', impedance_balance = '" + impedance_balance + "', courses = '" + courses + "', " +
        "showers = '" + showers + "' WHERE user_id ='" + user_id + "';";
    con.query(change_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[BOOLEAN DATA AGGIORNATI]');
        }
    });
})

app.get('/gym/get_new_trainers/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_new_trainers/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "select T.user_id, U.name, lastname, email, qualification, fiscal_code from personal_trainers T join users U on U.user_id = T.user_id " +
        "EXCEPT select P.user_id, name, lastname, email, qualification, fiscal_code from personal_trainers as P join gym_trainers as G on" +
        " P.user_id = G.user_id JOIN users Y ON Y.user_id = P.user_id where gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var email = result.rows[i].email;
                    var qualification = result.rows[i].qualification;
                    var fiscal_code = result.rows[i].fiscal_code;

                    var tmp = {
                        "user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "email": email,
                        "qualification": qualification,
                        "fiscal_code": fiscal_code
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_trainers SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.get('/gym/get_new_nutritionists/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_new_nutritionists/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "select T.user_id, U.name, lastname, email, qualification, fiscal_code from nutritionists T join users U on U.user_id = T.user_id EXCEPT select P.user_id, name, lastname, email, " +
        "qualification, fiscal_code FROM nutritionists P join gym_nutritionists as G on P.user_id = G.user_id JOIN users Y ON Y.user_id = P.user_id where gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var email = result.rows[i].email;
                    var qualification = result.rows[i].qualification;
                    var fiscal_code = result.rows[i].fiscal_code;

                    var tmp = {
                        "user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "email": email,
                        "qualification": qualification,
                        "fiscal_code": fiscal_code
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_trainers SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/gym/insert_course/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/insert_course/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var trainer_id = to_add.trainer_id;
    var description = to_add.description;
    var title = to_add.title;
    var category = to_add.category;
    var start_date = to_add.start_date;
    var end_date = to_add.end_date;
    var max_persons = to_add.max_persons;


    var query = "INSERT INTO courses (gym_id, trainer_id, description, title, category, start_date, end_date, max_persons) VALUES ('" + gym_id + "', '" + trainer_id + "', '" + description + "','" + title + "','" + category + "',TO_DATE('" + start_date + "', 'DD/MM/YYYY'), TO_DATE('" + end_date + "', 'DD/MM/YYYY'), '" + max_persons + "');";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel creare il corso!]', err);
        } else {

			res.statusCode = 200;
			res.end();
			console.log('[Corso aggiunto]');

        }

    });
});

app.get('/gym/get_courses/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_courses/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "SELECT course_id, name, lastname, description, title, category, start_date, end_date, max_persons FROM courses AS C JOIN users AS U ON C.trainer_id = U.user_id WHERE gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
					var course_id = result.rows[i].course_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var description = result.rows[i].description;
                    var title = result.rows[i].title;
                    var category = result.rows[i].category;
                    var start_date = result.rows[i].start_date;
					var end_date = result.rows[i].end_date;
                    var max_persons = result.rows[i].max_persons;

                    var tmp = {
						"course_id": course_id,
                        "name": name,
                        "lastname": lastname,
                        "description": description,
                        "title": title,
                        "category": category,
						"start_date": start_date,
                        "end_date": end_date,
                        "max_persons": max_persons
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_courses SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/customer/insert_completed_training_day/', (req, res, next) => {
    console.log("Rispondo richiesta:'/customer/insert_completed_training_day/");
    var to_add = req.body;

    var training_sheet_id = to_add.training_sheet_id;
    var seq = to_add.seq;
    var completion_date = to_add.completion_date;
    var user_comment = to_add.user_comment;

    var insert_query = "INSERT INTO completed_training_days (training_sheet_id, seq, completion_date, user_comment) VALUES ('" + training_sheet_id + "','" + seq + "', TO_DATE('" + completion_date + "' , 'DD-MM-YYYY'),'" + user_comment + "');";
    con.query(insert_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[INSERITO NUOVO COMPLETED TRAINING DAY]');
        }
    });
})

app.get('/gym/send_del_course_notification/:course_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/send_del_course_notification/:course_id");
    var course_id = req.params.course_id;
    var select_query = "SELECT U.user_id, C.title FROM course_users AS U JOIN courses as C ON U.course_id = C.course_id WHERE U.course_id = '" + course_id + "';";
    con.query(select_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore prendere gli user del corso!]',err)
        } else {
            if (result.rowCount > 0) {
                var title = result.rows[0].title;
                // MANDO NOTIFICA A
                for (var i = 0; i < result.rowCount; i++) {
                    var user_id = result.rows[i].user_id;
                    var insert_notification = "INSERT INTO notifications (notification_type, text, user_id ) VALUES ( '10', 'Il tuo corso: "+title+" è stato cancellato',  '" + user_id + "');";
                    con.query(insert_notification, function (err, result, fields) {
                        if (err) {
                            res.statusCode = 500;
                            res.end();
                            console.log('[Errore nel cancellare il corso!]');
                        }
                    });
                    console.log(user_id + " " + course_id);
                    var delete_course_users = "DELETE FROM course_users WHERE user_id =  '" + user_id + "' AND course_id = '" + course_id + "';";
                    con.query(delete_course_users, function (err, result, fields) {
                        if (err) {
                            res.statusCode = 500;
                            res.end();
                            console.log('[Errore nel cancellare gli user dal corso!]');
                        }
                    });
                }
                var delete_query = "DELETE FROM courses WHERE course_id = '" + course_id + "';";
                con.query(delete_query, function (err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[Errore nel cancellare il corso!]', err);
                    }
                    console.log('[Corso eliminato]');

                });
                res.statusCode = 200;
                res.end();
                console.log('[GET gym_courses SUCCESS]');
            } else {
                var delete_query = "DELETE FROM courses WHERE course_id = '" + course_id + "';";
                con.query(delete_query, function (err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[Errore nel cancellare il corso!]', err);
                    }
                });
                console.log('[Corso eliminato]');
                res.statusCode = 200;
                res.end();
                console.log('[GET gym_courses SUCCESS]');
            }
        }
    });






});

app.get('/gym/get_customers/:gym_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/get_customers/:gym_id");
    var gym_id = req.params.gym_id;
    var query = "SELECT U.user_id, name, lastname, birthdate , email FROM gym_customers AS G JOIN customers AS C ON G.user_id = C.user_id JOIN users AS U ON C.user_id = U.user_id WHERE gym_id = '" + gym_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
					var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var birthdate = result.rows[i].birthdate;
                    var email = result.rows[i].email;

                    var tmp = {
						"user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "birthdate": birthdate,
                        "email": email
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET gym_customers SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/gym/delete_gym_customer/', (req, res, next) => {
    console.log("Rispondo richiesta:'/gym/delete_gym_customer/");
    var to_add = req.body;

    var gym_id = to_add.gym_id;
    var user_id = to_add.user_id;

    var delete_query = "DELETE FROM gym_customers WHERE gym_id = '" + gym_id + "' AND user_id = '" + user_id + "';";
    con.query(delete_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[Errore nel cancellare il CUSTOMER!]')
        } else {
            console.log('[Customer eliminato dai propri clienti]');
            res.statusCode = 200;
            res.end();
        }

    });
});
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

    var user_query = "INSERT INTO personal_trainers (user_id, qualification, fiscal_code) VALUES ('" + user_id + "','" + qualification + "','" + fiscal_code + "');";
    con.query(user_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            //SUCCESS FINALE
            res.statusCode = 200;
            res.end();
            console.log('[Trainer aggiunto]');
        }
    });
})

app.get('/trainer/get_all_data/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /trainer/get_all_data/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM personal_trainers WHERE user_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var qualification = result.rows[0].qualification;
                var fiscal_code = result.rows[0].fiscal_code;
                res.statusCode = 200;
                res.json({
                    "qualification": qualification,
                    "fiscal_code": fiscal_code
                });
                res.end();
                console.log('[GET TRAINER DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/trainer/update_qualification/', (req, res, next) => {
    console.log("Rispondo richiesta:/trainer/update_qualification/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var qualification = to_add.qualification;

    var change_query = "UPDATE personal_trainers SET qualification = '" + qualification + "' WHERE user_id ='" + user_id + "';";
    con.query(change_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[QUALIFICA AGGIORNATA]');
        }
    });
})

app.get('/trainer/get_training_sheets/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /trainer/get_training_sheets/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT training_sheet_id, customer_id, name, TO_CHAR(creation_date, 'dd Mon YYYY') AS creation_date, title, " +
        "description, strength, number_of_days FROM training_sheets AS T JOIN users AS U ON T.trainer_id=U.user_id WHERE customer_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var training_sheet_id = result.rows[i].training_sheet_id;
                    var customer_id = result.rows[i].customer_id;
                    var trainer_id = result.rows[i].trainer_id;
                    var trainer_name = result.rows[i].name;
                    var creation_date = result.rows[i].creation_date;
                    var title = result.rows[i].title;
                    var strength = result.rows[i].strength;
                    var description = result.rows[i].description;
                    var number_of_days = result.rows[i].number_of_days;

                    var tmp = {
                        "training_sheet_id": training_sheet_id,
                        "customer_id": customer_id,
                        "trainer_id":trainer_id,
                        "trainer_name": trainer_name,
                        "creation_date": creation_date,
                        "title": title,
                        "strength": strength,
                        "description": description,
                        "number_of_days": number_of_days
                    };
                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET TRAINING SHEETS OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})


app.get('/trainer/get_training_sheet/:training_sheet_id', (req, res) => {
    console.log("Rispondo richiesta: /trainer/get_training_sheet/:training_sheet_id");
    var trainingSheetId = req.params.training_sheet_id;
    var query = "SELECT training_sheet_id, customer_id, title, strength, TO_CHAR(creation_date, 'dd Mon YYYY') AS creation_date, title, " +
        "description, number_of_days, U.name FROM training_sheets AS S JOIN users AS U ON S.trainer_id=U.user_id WHERE training_sheet_id = \'" + trainingSheetId + "\';";

    console.log("Is scheda: " + trainingSheetId);

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var training_sheet_id = result.rows[0].training_sheet_id;
                var customer_id = result.rows[0].customer_id;
                var creation_date = result.rows[0].creation_date;
                var trainer_name = result.rows[0].name;
                var title = result.rows[0].title;
                var strength = result.rows[0].strength;
                var description = result.rows[0].description;
                var number_of_days = result.rows[0].number_of_days;

                var query2 = "SELECT training_sheet_id, seq FROM training_days WHERE training_sheet_id = \'" + trainingSheetId + "\';";
                con.query(query2, function (err2, result2, fields2) {
                    if (err2) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[PostgreSQL ERROR]', err2);
                    } else {

                        var trainingDays = [];

                        for (var i = 0; i < result2.rowCount; i++) {
                            var training_day_id = result2.rows[i].training_day_id;
                            var seq = result2.rows[i].seq;


                            var trainingDay = {
                                "training_sheet_id": training_sheet_id,
                                "seq": seq
                            }
                            trainingDays.push(trainingDay);
                        }


                        var query3 = "SELECT seq, TO_CHAR(completion_date, 'dd-MM-YYYY') AS completion_date, user_comment FROM completed_training_days WHERE training_sheet_id = \'" + trainingSheetId + "\';";
                        con.query(query3, function (err3, result3, fields3) {
                            if (err3) {
                                res.statusCode = 500;
                                res.end();
                                console.log('[PostgreSQL ERROR]', err3);
                            } else {

                                var completedDays = [];

                                for (var i = 0; i < result3.rowCount; i++) {
                                    var seq = result3.rows[i].seq;
                                    var completion_date = result3.rows[i].completion_date;
                                    var user_comment = result3.rows[i].user_comment;

                                    var completedDay = {
                                        "seq": seq,
                                        "completion_date": completion_date,
                                        "user_comment": user_comment
                                    }
                                    completedDays.push(completedDay);
                                }



                                var query4 = "SELECT day_exercise_id, training_sheet_id, seq, D.exercise_id, user_comment," +
                                    " name, repetitions, description FROM day_exercises AS D JOIN exercises AS E ON D.exercise_id=E.exercise_id WHERE training_sheet_id = \'" + training_sheet_id+ "\';";
                                con.query(query4, function (err4, result4, fields4) {
                                    if (err4) {
                                        res.statusCode = 500;
                                        res.end();
                                        console.log('[PostgreSQL ERROR]', err4);
                                    } else {

                                        var exercises = [];

                                        for (var i = 0; i < result4.rowCount; i++) {
                                            var day_exercise_id= result4.rows[i].day_exercise_id;
                                            var training_sheet_id = result4.rows[i].training_sheet_id;
                                            var seq = result4.rows[i].seq;
                                            var exercise_id = result4.rows[i].exercise_id;
                                            var user_comment = result4.rows[i].user_comment;
                                            var exercise_name = result4.rows[i].name;
                                            var exercise_description = result4.rows[i].description;
                                            var repetitions = result4.rows[i].repetitions;

                                            var exercise = {
                                                "day_exercise_id":day_exercise_id,
                                                "training_sheet_id":training_sheet_id,
                                                "seq": seq,
                                                "exercise_id":exercise_id,
                                                "completion_date": completion_date,
                                                "user_comment": user_comment,
                                                "name": exercise_name,
                                                "description":exercise_description,
                                                "repetitions":repetitions
                                            }
                                            exercises.push(exercise);
                                        }

                                        var tmp = {
                                            "training_sheet_id": training_sheet_id,
                                            "customer_id": customer_id,
                                            "trainer_name": trainer_name,
                                            "creation_date": creation_date,
                                            "title": title,
                                            "description": description ,
                                            "number_of_days": number_of_days,
                                            "strength":strength,
                                            "training_days": trainingDays,
                                            "completed_days": completedDays,
                                            "exercises":exercises
                                        }


                                        res.statusCode = 200;
                                        res.json(tmp);
                                        res.end();
                                        console.log(tmp);

                                    }
                                });

                                }

                        });


                    }
                });

            } else {
                res.statusCode = 404;
                res.end();
                console.log('[NO DATA FOUND]', err);
            }
        }


    });
});

app.get('/trainer/get_customers/:trainer_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/trainer/get_customers/:trainer_id");
    var trainer_id = req.params.trainer_id;
    var query = "SELECT U.user_id, U.name, U.lastname, U.email , U.birthdate FROM users U JOIN gym_customers C ON U.user_id = C.user_id JOIN gym_trainers T ON C.gym_id = T.gym_id WHERE T.user_id  = '" + trainer_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
					var user_id = result.rows[i].user_id;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;
                    var birthdate = result.rows[i].birthdate;
                    var email = result.rows[i].email;

                    var tmp = {
						"user_id": user_id,
                        "name": name,
                        "lastname": lastname,
                        "birthdate": birthdate,
                        "email": email
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET trainer_customer SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.get('/trainer/get_training_sheets_customer/:user_id', (req, res, next) => {
    console.log("Rispondo richiesta:'/trainer/get_training_sheets_customer/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT T.*, U.name, U.lastname FROM training_sheets T JOIN users U ON T.trainer_id = U.user_id WHERE customer_id = '" + user_id + "';";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
					var training_sheet_id = result.rows[i].training_sheet_id;
                    var customer_id = result.rows[i].customer_id;
                    var trainer_id = result.rows[i].trainer_id;
                    var creation_date = result.rows[i].creation_date;
                    var title = result.rows[i].title;
                    var description = result.rows[i].description;
                    var number_of_days = result.rows[i].number_of_days;
                    var strength = result.rows[i].strength;
                    var name = result.rows[i].name;
                    var lastname = result.rows[i].lastname;

                    var tmp = {
						"training_sheet_id": training_sheet_id,
                        "customer_id": customer_id,
                        "trainer_id": trainer_id,
                        "creation_date": creation_date,
                        "title": title,
                        "description": description,
                        "number_of_days": number_of_days,
                        "strength": strength,
                        "name": name,
                        "lastname": lastname
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET training_sheet_customer SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})

app.post('/trainer/create_training_sheet/', (req, res, next) => {
    console.log("Rispondo richiesta:'/trainer/create_training_sheet/");
    var to_add = req.body;

    var customer_id = to_add.customer_id;
    var trainer_id = to_add.trainer_id;
    var creation_date = to_add.creation_date;
    var title = to_add.title;
    var description = to_add.description;
    var number_of_days = to_add.number_of_days;
    var strength = 50;

    var user_query = "INSERT INTO training_sheets (customer_id, trainer_id, creation_date, title, description, number_of_days, strength) VALUES ('" + customer_id + "','" + trainer_id + "',TO_DATE('" + creation_date + "', 'DD/MM/YYYY'),'" + title + "','" + description + "','" + number_of_days + "','" + strength + "') RETURNING training_sheet_id;";
    con.query(user_query, function(err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            var training_sheet_id = result.rows[0].training_sheet_id;
            //SUCCESS FINALE
            for (var i = 1; i <= number_of_days; i++) {
                var add_query = "INSERT INTO training_days VALUES ('" + training_sheet_id + "', '" + i + "');";
                con.query(add_query, function(err, result, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.end();
                        console.log('[PostgreSQL ERROR]', err);
                    }
                });
            }
            res.statusCode = 200;
            res.json({
                "training_sheet_id": training_sheet_id
            });
            res.end();
            console.log('[Training sheet creato]');

        }
    });
})

app.get('/trainer/get_exercises/', (req, res, next) => {
    console.log("Rispondo richiesta:'/trainer/get_exercises/");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM exercises ";

    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {

                var j_arr = [];

                for (var i = 0; i < result.rowCount; i++) {
                    var exercise_id = result.rows[i].exercise_id;
                    var name = result.rows[i].name;


                    var tmp = {
                        "exercise_id": exercise_id,
                        "name": name
                    };

                    j_arr.push(tmp);
                }
                res.statusCode = 200;
                res.json(j_arr);
                res.end();
                console.log('[GET exercises SUCCESS]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET ERROR : empty search]', err);
            }
        }
    });
})


app.post('/trainer/insert_day_exercises/', (req, res, next) => {
    console.log("Rispondo richiesta:'/trainer/insert_day_exercises/");
    var to_check = req.body;

    var training_sheet_id = to_check.training_sheet_id;
    var seq = to_check.seq;
    var repetitions = to_check.repetitions;
    var exercise_id = to_check.exercise_id;

    var insert_day_exercises_query = "INSERT INTO day_exercises (training_sheet_id, seq, repetitions, exercise_id) VALUES ('" + training_sheet_id + "', '" + seq + "','" + repetitions + "','" + exercise_id + "');";
    con.query(insert_day_exercises_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
        }
    });
});
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

    var user_query = "INSERT INTO nutritionists (user_id, qualification, fiscal_code) VALUES ('" + user_id + "','" + qualification + "','" + fiscal_code + "');";
    con.query(user_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            //SUCCESS FINALE
            res.statusCode = 200;
            res.end();
            console.log('[Nutrizionista aggiunto]');
        }
    });
});

app.get('/nutritionist/get_all_data/:user_id', (req, res) => {
    console.log("Rispondo richiesta: /nutritionist/get_all_data/:user_id");
    var user_id = req.params.user_id;
    var query = "SELECT * FROM nutritionists WHERE user_id = \'" + user_id + "\';";
    con.query(query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            if (result.rowCount > 0) {
                var qualification = result.rows[0].qualification;
                var fiscal_code = result.rows[0].fiscal_code;
                res.statusCode = 200;
                res.json({
                    "qualification": qualification,
                    "fiscal_code": fiscal_code
                });
                res.end();
                console.log('[GET NUTRITIONIST DATA OK]');
            } else {
                res.statusCode = 404;
                res.end();
                console.log('[GET DATA ERROR]', err);
            }
        }
    });
})

app.post('/nutritionist/update_qualification/', (req, res, next) => {
    console.log("Rispondo richiesta:/nutritionist/update_qualification/");
    var to_add = req.body;

    var user_id = to_add.user_id;
    var qualification = to_add.qualification;

    var change_query = "UPDATE nutritionists SET qualification = '" + qualification + "' WHERE user_id ='" + user_id + "';";
    con.query(change_query, function (err, result, fields) {
        if (err) {
            res.statusCode = 500;
            res.end();
            console.log('[PostgreSQL ERROR]', err);
        } else {
            res.statusCode = 200;
            res.end();
            console.log('[QUALIFICA AGGIORNATA]');
        }
    });
})

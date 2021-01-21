/////////////// Import
const express = require('express');
const hostname = '127.0.0.1';
const { Pool, Client } = require('pg');
const http = require('http');
const port = 4000;



/////////////// Connessione al database.
const database = new Client({
  user: "postgres",
  password: "postgresql",
  host:'127.0.0.1',
  port:"5432",
  database:"gymme-db",
	multipleStatements: true
});
database.connect()
.then(() => console.log("Connected successfuly"))
.catch(err => console.log(err));

/////////////// Avvio del server web.
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

const app = express();

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

///////////////////////////////
///                         ///
///     API CONSUMER        ///
///                         ///
///////////////////////////////








///////////////////////////////
///                         ///
///     API NUTRITIONIST    ///
///                         ///
///////////////////////////////






///////////////////////////////
///                         ///
///       API TRAINER       ///
///                         ///
///////////////////////////////





///////////////////////////////
///                         ///
///       API GYM           ///
///                         ///
///////////////////////////////

/*
ranking/teams/{season_tag}
Ritorno classifica di una stagione classifica richiesta
*/
app.get('/ranking/teams/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /ranking/teams/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT position, name, points FROM rankings AS R join teams AS T on R.team_id = T.team_id WHERE season_tag = '"+ season_tag +"' ORDER BY points DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});
/*
ranking/goals/{season_tag}
Ritorno classifica marcatori data una stagione clacistica
*/
app.get('/ranking/goals/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /ranking/goals/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT goals, name FROM scorers AS S JOIN players AS P ON S.player_id = P.player_id WHERE season_tag = '"+season_tag+"' ORDER BY goals DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
ranking/yellows/{season_tag}
Ritorno classifica dei cartellini gialli presi dai giocatori in una stagione clacistica
*/
app.get('/ranking/yellows/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /ranking/yellows/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT cards, name FROM yellows AS Y JOIN players AS P ON Y.player_id = P.player_id WHERE season_tag = '"+season_tag+"' ORDER BY cards DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
ranking/reds/{season_tag}
Ritorno classifica dei cartellini rossi presi dai giocatori in una stagione clacistica
*/
app.get('/ranking/reds/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /ranking/reds/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT cards, name FROM reds AS R JOIN players AS P ON R.player_id = P.player_id WHERE season_tag = '"+season_tag+"' ORDER BY cards DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
ranking/cards/{season_tag}
Ritorno classifica dei cartellini totali presi dai giocatori in una stagione clacistica
*/
app.get('/ranking/cards/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /ranking/cards/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT sum(R.cards + Y.cards) as tot, name FROM yellows AS Y JOIN reds as R ON Y.player_id = R.player_id JOIN players AS P ON Y.player_id = P.player_id WHERE R.season_tag = '"+season_tag+"'AND Y.season_tag = '"+season_tag+"' GROUP BY name ORDER BY tot DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});





/*
/match/stats/{team_home}&{team_guest}&{season_tag}
Ritorno statistche di una partita di entrambe le squadre
*/
app.get('/match/stats/:team_home&:team_guest&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /match/stats/:team_home&:team_guest&:season_tag");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT G.game_id, name, possesso, tiri, in_porta, fuori, punizioni, angoli, fuorigioco, rimesse, parate, falli, rossi, gialli, passaggi, contrasti, attacchi, att_pericolosi FROM stats as S JOIN teams as T ON S.team_id = T.team_id JOIN games as G on S.game_id = G.game_id WHERE G.home_id = '"+home_id+"' AND G.guest_id = '"+guest_id+"' AND G.season_tag = '"+season_tag+"';";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});

/*
/match/info/{team_home}&{team_guest}&{season_tag}
Ritorno informazioni di una partita
*/
app.get('/match/info/:team_home&:team_guest&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /match/info/:team_home&:team_guest&:season_tag");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT G.game_id, T1.name AS home, T2.name AS guest, G.home_id, G.guest_id, res_home, res_guest, referee, spectators, stadium FROM games AS G JOIN teams AS T1 ON G.home_id = T1.team_id JOIN teams AS T2 ON G.guest_id = T2.team_id WHERE home_id = '"+home_id+"' AND guest_id = '"+guest_id+"' AND season_tag = '"+season_tag+"';";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});

/*
/match/formations/{team_home}&{team_guest}&{season_tag}
Ritorno formazioni di una partita di entrambe le squadre
*/
app.get('/match/formations/:team_home&:team_guest&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /match/formations/:team_home&:team_guest&:season_tag");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT F.game_id, T.name, P.name, P.nation, P.number FROM games AS G JOIN formations AS F ON G.game_id = F.game_id JOIN teams AS T ON F.team_id = T.team_id JOIN players AS P ON F.player_id = P.player_id WHERE G.season_tag = '"+season_tag+"' AND G.home_id = '"+home_id+"' AND G.guest_id = '"+guest_id+"' ORDER BY T.name;";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});

/*
/match/quotas/{team_home}&{team_guest}&{season_tag}
Ritorno quote di una partita
*/
app.get('/match/quotas/:team_home&:team_guest&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /match/quotas/:team_home&:team_guest&:season_tag");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT Q.game_id, Q.bookmaker, Q.home, Q.draw, Q.guest FROM quotas AS Q JOIN games AS G On Q.game_id = G.game_id WHERE G.season_tag = '"+season_tag+"' AND G.home_id = '"+home_id+"' AND G.guest_id = '"+guest_id+"';";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});

/*
/match/notes/{team_home}&{team_guest}&{season_tag}
Ritorno 'telecronaca' di una partita
*/
app.get('/match/notes/:team_home&:team_guest&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /match/notes/:team_home&:team_guest&:season_tag");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT N.game_id, minute, comment FROM notes AS N JOIN games AS G ON N.game_id = G.game_id WHERE G.season_tag = '"+season_tag+"' AND G.home_id = '"+home_id+"' AND G.guest_id = '"+guest_id+"' ORDER BY minute ASC;";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});

/*
/match/info/{team_home}&{team_guest}
Ritorno storico partite tra due squadre
*/
app.get('/match/historic/:team_home&:team_guest', (req, res) => {
  console.log("Rispondo richiesta: /match/historic/:team_home&:team_guest");
  var season_tag = req.params.season_tag;
  var team_home = req.params.team_home;
  var team_guest = req.params.team_guest;
  var query_home = "SELECT team_id FROM teams WHERE name = '"+team_home+"';";
  var query_guest = "SELECT team_id FROM teams WHERE name = '"+team_guest+"';";

  // prendo id squadra in casa
  database.query(query_home).then(home_res => {
    var home_id = home_res.rows[0].team_id;
    // prendo id squadra in traferta
    database.query(query_guest).then(guest_res => {
      var guest_id = guest_res.rows[0].team_id;
      // QUERY EFFETTIVA
      var query = "SELECT G.game_id, T1.name AS home, T2.name AS guest, G.home_id, G.guest_id, res_home, res_guest, referee, spectators, stadium, season_tag FROM games AS G JOIN teams AS T1 ON G.home_id = T1.team_id JOIN teams AS T2 ON G.guest_id = T2.team_id WHERE (home_id = '"+home_id+"' AND guest_id = '"+guest_id+"') OR (home_id = '"+guest_id+"' AND guest_id = '"+home_id+"') ORDER BY season_tag DESC;";

      database.query(query, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.json({
             'message':'Internal Server Error',
             'data': err
          })
        } else {
          var data = result.rows;
          if (data.length == 0) {
            res.statusCode = 404;
            res.json({
               'message':'Data not present on the DB'
            })
          } else {
            res.statusCode = 200;
            res.json({
              'message':'Success',
              'data': data
            })
          }
        }
        res.end();
      })

    }).catch(err => {
      console.log("Errore lettura guest_id: /n" +err);
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      });
    })
  }).catch(err => {
    console.log("Errore lettura home_id: /n" +err);
    res.statusCode = 500;
    res.json({
       'message':'Internal Server Error',
       'data': err
    });
  });
});






/*
/player/list/{season_tag}
Ritorno lista giocatori di una stagione
*/
app.get('/player/list/:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /player/list/:season_tag");
  var season_tag = req.params.season_tag;
  var query = "SELECT DISTINCT P.player_id, P.name, P.number, P.nation, T.name AS team FROM players AS P JOIN formations AS F ON P.player_id = F.player_id JOIN games AS G ON F.game_id = G.game_id JOIN teams AS T ON F.team_id = T.team_id WHERE G.season_tag = '"+season_tag+"' ORDER BY team ASC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
/player/goals/{name}&{season_tag}
Ritorno goal seganti da un giocatori durante una stagione
*/
app.get('/player/goals/:name&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /player/goals/:name&:season_tag");
  var name = req.params.name;
  var season_tag = req.params.season_tag;
  var query = "SELECT P.name, S.goals, season_tag FROM scorers AS S JOIN players AS P ON S.player_id = P.player_id WHERE name = '"+name+"' AND season_tag = '"+season_tag+"';";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
/player/yellows/{name}&{season_tag}
Ritorno cartellini gialli presi da un giocatori durante una stagione
*/
app.get('/player/yellows/:name&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /player/yellows/:name&:season_tag");
  var name = req.params.name;
  var season_tag = req.params.season_tag;
  var query = "SELECT P.name, Y.cards, season_tag FROM yellows AS Y JOIN players AS P ON Y.player_id = P.player_id WHERE name = '"+name+"' AND season_tag = '"+season_tag+"';";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
/player/reds/{name}&{season_tag}
Ritorno cartellini rossi presi da un giocatori durante una stagione
*/
app.get('/player/reds/:name&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /player/reds/:name&:season_tag");
  var name = req.params.name;
  var season_tag = req.params.season_tag;
  var query = "SELECT P.name, R.cards, season_tag FROM reds AS R JOIN players AS P ON R.player_id = P.player_id WHERE name = '"+name+"' AND season_tag = '"+season_tag+"';";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});

/*
/player/cards/{name}&{season_tag}
Ritorno cartellini totali presi da un giocatori durante una stagione
*/
app.get('/player/cards/:name&:season_tag', (req, res) => {
  console.log("Rispondo richiesta: /player/cards/:name&:season_tag");
  var name = req.params.name;
  var season_tag = req.params.season_tag;
  var query = "SELECT  P.name, sum(R.cards + Y.cards) as tot FROM yellows AS Y JOIN reds as R ON Y.player_id = R.player_id JOIN players AS P ON Y.player_id = P.player_id WHERE R.season_tag = '"+season_tag+"' AND Y.season_tag = '"+season_tag+"' AND P.name = '"+name+"' GROUP BY name ORDER BY tot DESC;";
  database.query(query, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
         'message':'Internal Server Error',
         'data': err
      })
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res.statusCode = 404;
        res.json({
           'message':'Data not present on the DB'
        })
      } else {
        res.statusCode = 200;
        res.json({
          'message':'Success',
          'data': data
        })
      }
    }
    res.end();
  })
});


//UTILI
async function get_team_id (team_name){
  var query = "SELECT team_id FROM teams WHERE name = '"+team_name+"';";
  var res = 0;
  await database.query(query, (err, result) => {
    if (err) {
      res = 0;
    } else {
      var data = result.rows;
      if (data.length == 0) {
        res = 0;
      } else {
        var id = data[0].team_id;
        res = id;
      }
    }
  });
  return res;
}

var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'pecapreco',
  user: 'postgres',
  password: 'postgres'
});

// add query functions

module.exports = {
  getPaginaLojasCompletas: getPaginaLojasCompletas,
  getPaginaHistoricos: getPaginaHistoricos,
  getLojasMinimasPorNome: getLojasMinimasPorNome,
  //getLojaCompleta: getLojaCompleta,
  //getCarroUsuario: getCarroUsuario,
  //postCriarUsuario: postCriarUsuario,
  postCriarSessao: postCriarSessao,
  postCriarHistorico: postCriarHistorico//,
  //postCriarCarroUsuario: postCriarCarroUsuario,
  //postUploadHistorico: postUploadHistorico
};

// Pega uma página de lojas ao dar a quantidade de lojas em uma "página" e a sua posição na "página"
function getPaginaLojasCompletas(req, res, next) {
  var quantLojas = parseInt(req.query.quant);
  var lojaIndex = parseInt(req.query.index);

  if (isNaN(quantLojas) || isNaN(lojaIndex)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select lerQuantLojasCompletaJson($1,$2) as lojas', [quantLojas, lojaIndex])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Cria uma sessão a partir de um login e uma senha
function postCriarSessao(req, res, next) {
  var login = req.body.login;
  var senha = req.body.senha;

  if (typeof login == "undefined" || login == "" || typeof senha == "undefined" || senha == "") {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }
  
  db.one('select * from buscarUsuarioPorLogin($1) as resultado', [login])
    .then(function (data) {
      //var dataJSON = JSON.parse(data);
      console.log("Senha Fornecida: " + senha + " Senha guardada: " + data.resultado.senha);
      if (data.resultado.senha == senha) {
        console.log("Senha correta!");
        var token = login + senha + new Date().toISOString();
        db.none('insert into tab_sessoes(token,fk_id_usuario) VALUES($1, $2)', [token, data.resultado.pk_id_usuario])
        .then(function (data) {
          var respostaJSON = '{ "token": "' + token + '"}';
          res.status(200).send(JSON.parse(respostaJSON));
        })
        .catch(function (err) {
          res.status(500);
          res.send('A sessão não pode ser criada. Tente novamente mais tarde.');
        });
      } else {
        res.status(403);
        res.send('Senha/login inválidos.');
        return;
      }
    })
    .catch(function (err) {
      return next(err);
    });

}

// Guarda uma linha de histórico no banco de dados.
function postCriarHistorico(req, res, next) {
  var dadosOBD = req.body.dadosOBD;
  var diaEnvio = parseInt(req.body.diaEnvio);
  var mesEnvio = parseInt(req.body.mesEnvio);
  var anoEnvio = parseInt(req.body.anoEnvio);
  var horaEnvio = parseInt(req.body.horaEnvio);
  var minutoEnvio = parseInt(req.body.minutoEnvio);
  var segundoEnvio = parseInt(req.body.segundoEnvio);
  var idCarroUsuario = parseInt(req.body.idCarroUsuario);
  var dataHoraEnvio;
  var isJson = true;
  var problema = "";

  if (isNaN(diaEnvio) && isNaN(mesEnvio) && isNaN(anoEnvio) && isNaN(horaEnvio) && isNaN(minutoEnvio) && isNaN(segundoEnvio)) {
    dataHoraEnvio = null;
    //Pra passar pelo if gigante
    diaEnvio = 00;
    mesEnvio = 00;
    anoEnvio = 00;
    horaEnvio = 00;
    minutoEnvio = 00;
    segundoEnvio = 00;
  }

  // para produção, ver se existe algum ; no JSON (por causa de SQL injection)
  try {
    dadosOBD = dadosOBD.trim();
    if (typeof dadosOBD == "undefined" || dadosOBD == "") {
      isJson = false;
      problema = "Não ser JSON válido por estar vazio";
    }

    if (problema == "") {
      var jsonDadosObd = JSON.parse(dadosOBD);
    }

  } catch (e) {
    isJson = false;
    problema = "Não ser JSON válido";
    console.log("JSON: " + dadosOBD);
  }

  if (isNaN(idCarroUsuario) || !isJson
    || isNaN(diaEnvio) || isNaN(mesEnvio) || isNaN(anoEnvio) || isNaN(horaEnvio) || isNaN(minutoEnvio) || isNaN(segundoEnvio)) {

    if (typeof problema != "undefined") {
      console.log("O problema foi:" + problema + "e/ou não ter data/hora válidas");
    } else {
      console.log("O problema foi: não ter data/hora válidas");
    }
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  dataHoraEnvio = new Date(anoEnvio, mesEnvio, diaEnvio, horaEnvio, minutoEnvio, segundoEnvio);


  db.none('insert into tab_historicos(fk_id_CarroUsuario, dataHoraEnvio, dadosobd) VALUES($1,$2,$3)', [idCarroUsuario, dataHoraEnvio.toISOString(), dadosOBD])
    .then(function (data) {
      res.status(201).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Pega uma lista de nomes e ids de lojas ao ser fornecido parte de um nome
function getLojasMinimasPorNome(req, res, next) {
  var parteNome = req.query.nome;
  parteNome = parteNome.trim();
  console.log(parteNome);
  if (typeof parteNome == 'undefined' || parteNome == "") {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select * from buscarLojasPorNome($1) as resultados', [parteNome])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Pega uma página de historicos ao dar o carroUsuario relacionado, a timestamp de inicio e fim da busca e a quantidade de resultados + posição na página
function getPaginaHistoricos(req, res, next) {
  var tokenSessao = req.query.tokenSessao;
  var idCarroUsuario = parseInt(req.query.id);
  var diaInicio = parseInt(req.query.diaInicio);
  var mesInicio = parseInt(req.query.mesInicio);
  var anoInicio = parseInt(req.query.anoInicio);
  var horaInicio = parseInt(req.query.horaInicio);
  var minutoInicio = parseInt(req.query.minutoInicio);
  var segundoInicio = parseInt(req.query.segundoInicio);
  var diaFim = parseInt(req.query.diaFim);
  var mesFim = parseInt(req.query.mesFim);
  var anoFim = parseInt(req.query.anoFim);
  var horaFim = parseInt(req.query.horaFim);
  var minutoFim = parseInt(req.query.minutoFim);
  var segundoFim = parseInt(req.query.segundoFim);
  var quantHistorico = parseInt(req.query.quant);
  var historicoIndex = parseInt(req.query.index);

  var dataHoraInicio;
  var dataHoraFim;

  if (isNaN(diaInicio) && isNaN(mesInicio) && isNaN(anoInicio) && isNaN(horaInicio) && isNaN(minutoInicio) && isNaN(segundoInicio)) {
    dataHoraInicio = null;
    //Pra passar pelo if gigante
    diaInicio = 00;
    mesInicio = 00;
    anoInicio = 00;
    horaInicio = 00;
    minutoInicio = 00;
    segundoInicio = 00;
  }
  if (isNaN(diaFim) && isNaN(mesFim) && isNaN(anoFim) && isNaN(horaFim) && isNaN(minutoFim) && isNaN(segundoFim)) {
    dataHoraFim = null;
    //Pra passar pelo if gigante
    diaFim = 00;
    mesFim = 00;
    anoFim = 00;
    horaFim = 00;
    minutoFim = 00;
    segundoFim = 00;
  }

  if (isNaN(quantHistorico) || isNaN(historicoIndex) || isNaN(idCarroUsuario)
    || isNaN(diaInicio) || isNaN(mesInicio) || isNaN(anoInicio) || isNaN(horaInicio) || isNaN(minutoInicio) || isNaN(segundoInicio)
    || isNaN(diaFim) || isNaN(mesFim) || isNaN(anoFim) || isNaN(horaFim) || isNaN(minutoFim) || isNaN(segundoFim)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }


  dataHoraInicio = new Date(anoInicio, mesInicio, diaInicio, horaInicio, minutoInicio, segundoInicio);
  dataHoraFim = new Date(anoFim, mesFim, diaFim, horaFim, minutoFim, segundoFim);


  db.one('select lerQuantHistoricoJson($1, $2, $3, $4, $5) as historicos', [idCarroUsuario, dataHoraInicio.toISOString(), dataHoraFim.toISOString(), quantHistorico, historicoIndex])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}
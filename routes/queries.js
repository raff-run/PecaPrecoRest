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
  getLojasMinimasPorNome: getLojasMinimasPorNome//,
  //getLojaCompleta: getLojaCompleta,
  //getCarroUsuario: getCarroUsuario,
  //postCriarUsuario: postCriarUsuario,
  //postCriarSessao: postCriarSessao,
  //postCriarHistorico: postCriarSessao,
  //postCriarCarroUsuario: postCriarCarroUsuario,
  //postUploadHistorico: postUploadHistorico
};

// Pega uma página de lojas ao dar a quantidade de lojas em uma "página" e a sua posição na "página"
function getPaginaLojasCompletas(req, res, next) {
  var quantLojas = parseInt(req.query.quant);
  var lojaIndex = parseInt(req.query.index);

  if(isNaN(quantLojas) || isNaN(lojaIndex)){
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

// Pega uma lista de nomes e ids de lojas ao ser fornecido parte de um nome
function getLojasMinimasPorNome(req, res, next) {
  var parteNome = req.query.nome;
  parteNome = parteNome.trim();
  console.log(parteNome);
  if(typeof parteNome == 'undefined' || parteNome == ""){
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

  if(isNaN(diaInicio) && isNaN(mesInicio) && isNaN(anoInicio) && isNaN(horaInicio) && isNaN(minutoInicio) && isNaN(segundoInicio)){
    dataHoraInicio = null;
    //Pra passar pelo if gigante
    diaInicio = 00;
    mesInicio = 00;
    anoInicio = 00;
    horaInicio = 00;
    minutoInicio = 00;
    segundoInicio = 00;
  }
  if(isNaN(diaFim) && isNaN(mesFim) && isNaN(anoFim) && isNaN(horaFim) && isNaN(minutoFim) && isNaN(segundoFim)){
    dataHoraFim = null;
    //Pra passar pelo if gigante
    diaFim = 00;
    mesFim = 00;
    anoFim = 00;
    horaFim = 00;
    minutoFim = 00;
    segundoFim = 00;
  }

  if(isNaN(quantHistorico) || isNaN(historicoIndex) || isNaN(idCarroUsuario) 
    || isNaN(diaInicio) || isNaN(mesInicio) || isNaN(anoInicio) || isNaN(horaInicio) || isNaN(minutoInicio) || isNaN(segundoInicio)
    || isNaN(diaFim) || isNaN(mesFim) || isNaN(anoFim) || isNaN(horaFim) || isNaN(minutoFim) || isNaN(segundoFim)){
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  if(typeof dataHoraInicio == 'undefined'){
    dataHoraInicio = new Date(anoInicio, mesInicio, diaInicio, horaInicio, minutoInicio, segundoInicio);
  }
  if(typeof dataHoraFim == 'undefined'){
    dataHoraFim = new Date(anoFim, mesFim, diaFim, horaFim, minutoFim, segundoInicio);
  }
  
  db.one('select lerQuantHistoricoJson($1, $2, $3, $4, $5) as historicos', [idCarroUsuario, dataHoraInicio, dataHoraFim, quantHistorico, historicoIndex])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });
  
}
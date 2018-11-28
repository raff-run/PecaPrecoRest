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
  getLojaCompleta: getLojaCompleta,
  getCarroUsuario: getCarroUsuario,
  getServicosPorNome: getServicosPorNome,
  postCriarUsuario: postCriarUsuario,
  postCriarSessao: postCriarSessao,
  postCriarHistorico: postCriarHistorico,
  postCriarCarroUsuario: postCriarCarroUsuario,
  getPaginaLojasCompletasPorNome : getPaginaLojasCompletasPorNome,
  getUsuarioSessao : getUsuarioSessao,
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

// Pega uma página de lojas ao dar parte do nome, a quantidade de lojas em uma "página" e a sua posição na "página"
function getPaginaLojasCompletasPorNome(req, res, next) {
  var quantLojas = parseInt(req.query.quant);
  var lojaIndex = parseInt(req.query.index);
  var parteNome = req.query.nome;
  parteNome = parteNome.trim();
  console.log(parteNome);

  if(typeof parteNome == 'undefined' || parteNome == ""){
    getPaginaLojasCompletas(req, res, next);
    return;
  }

  if (isNaN(quantLojas) || isNaN(lojaIndex)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select lerQuantLojasCompletaNomeJson($1,$2,$3) as lojas', [quantLojas, lojaIndex, parteNome])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Pega uma única loja por ID.
function getLojaCompleta(req, res, next) {
  var lojaId = parseInt(req.query.lojaId);

  if (isNaN(lojaId)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select * from lerLojaCompletaJson($1) as loja', [lojaId])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

function getUsuarioSessao(req, res, next) {
  var token = req.query.token;

  if (typeof token == 'undefined' || token == "") {
    res.status(403);
    res.send('Token inválido.');
    return;
  }

  db.one('select * from buscarUsuarioPorSessao($1) as usuario', [token])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}


// Pega um único carroUsuario por ID
function getCarroUsuario(req, res, next) {
  var carroId = parseInt(req.query.carroId);

  if (isNaN(carroId)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select * from lerCarroUsuarioJson($1) as carro', [carroId])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Cria uma usuário a partir de seus dados pessoais.
function postCriarUsuario(req, res, next) {
  var nome = req.body.nome;
  var cidade = req.body.cidade;
  var uf = req.body.uf;
  var email = req.body.email;
  var senha = req.body.senha;

  if (typeof email == "undefined" || email == "" || typeof senha == "undefined" || senha == ""
  || typeof nome == "undefined" || nome == ""
  || typeof cidade == "undefined" || cidade == ""
  || typeof uf == "undefined" || uf == "") {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.none('insert into tab_usuarios(nome, cidade, uf, email, senha) VALUES($1, $2, $3, $4, $5)', [nome, cidade, uf, email, senha])
    .then(function (data) {
      res.status(201).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Registra o carro de um usuário.
function postCriarCarroUsuario(req, res, next) {
  var anoFabricacao = parseInt(req.body.anoFabricacao);
  var chassi = req.body.chassi;
  var diaCompra = parseInt(req.body.diaCompra);
  var mesCompra = parseInt(req.body.mesCompra);
  var anoCompra = parseInt(req.body.anoCompra);
  var quilometragem = parseInt(req.body.quilometragem);
  var fk_id_carro = parseInt(req.body.idCarro);
  var fk_id_usuario = parseInt(req.body.idUsuario);
  var dataCompra;

  if (isNaN(anoFabricacao) || typeof chassi == "undefined" || chassi == ""
  || isNaN(diaCompra) || isNaN(mesCompra) || isNaN(anoCompra)
  || isNaN(quilometragem) || isNaN(fk_id_carro) || isNaN(fk_id_usuario)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }
  
  dataCompra = new Date(anoCompra, mesCompra, diaCompra);

  db.none('insert into tab_carros_usuario(chassi, anoFabricacao, data_compra, quilometragem, fk_id_usuario, fk_id_carro) VALUES($1, $2, $3, $4, $5, $6)',
   [chassi, anoFabricacao, dataCompra.toISOString(), quilometragem, fk_id_usuario, fk_id_carro])
    .then(function (data) {
      res.status(201).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}

// Cria uma sessão a partir de um email e uma senha
function postCriarSessao(req, res, next) {
  var email = req.body.email;
  var senha = req.body.senha;

  if (typeof email == "undefined" || email == "" || typeof senha == "undefined" || senha == "") {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select * from buscarUsuarioPorEmail($1) as resultado', [email])
    .then(function (data) {
      console.log("Senha Fornecida: " + senha + " Senha guardada: " + data.resultado.senha);
      if (data.resultado.senha == senha) {
        console.log("Senha correta!");
        var token = email + senha + new Date().toISOString();
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
        res.send('Senha/email inválidos.');
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

// Pega uma lista de nomes e ids de lojas ao ser fornecido parte de um nome
function getServicosPorNome(req, res, next) {
  var parteNome = req.query.nome;
  parteNome = parteNome.trim();
  console.log(parteNome);
  if (typeof parteNome == 'undefined' || parteNome == "") {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }

  db.one('select * from buscarServicosPorNome($1) as servicos', [parteNome])
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

  if (isNaN(quantHistorico) || isNaN(historicoIndex) || isNaN(idCarroUsuario)) {
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
  }


  dataHoraInicio = new Date(0, 0, 0, 0, 0, 0);
  dataHoraFim = new Date(2020, 1, 1, 12, 1, 1);


  db.one('select lerQuantHistoricoJson($1, $2, $3, $4, $5) as historicos', [idCarroUsuario, null, null, quantHistorico, historicoIndex])
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });

}
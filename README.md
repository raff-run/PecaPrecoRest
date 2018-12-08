# PeçaPreçoRest

Agora em node.js!

Exemplo de método rest:
Em routes/queries.js
```javascript
/* 
 Aqui você deve tirar os comentários do método que você fez para poder testar.
 Ou adicionar o seu próprio método.
*/
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

// A função sempre recebe esses três parâmetros
// Escolha um nome auto-explicativo
function getLojasMinimasPorNome(req, res, next) {
  //Primeira parte: ler as variáveis passadas na requisição HTTP
  var parteNome = req.query.nome;
  /*
    req.query.<nome do parametro> = Traz os parâmetros passados em qualquer método HTTP exceto POST.

    req.body.<nome do parametro> = parece ser a função que funciona pra post especificamente.

    Para números, use parseInt(req.query.<nome>) ou parseFloat
  */
  // Segunda parte: preparação das variáveis
  /*
    Nessa parte, ajuste as variáveis para como o SQL deve aceitar e use trim() nas strings para evitar strings vazias.
    Opcionalmente imprima as variáveis para testar se estão sendo lidas corretamente
  */
  parteNome = parteNome.trim();
  console.log(parteNome);

  // Terceira parte: Impeça parâmetros inválidos
  /*
    Se uma variável obrigatória não for fornecida, o tipo dela vai ser 'undefined'. Então dá pra usar typeof variavel == undefined pra saber se o argumento foi passado ou não.
    Não dá pra permitir uma variável numérica receber letras também. Nesse caso, ao usar variavel = parseInt(parâmetro), se o parseint não achar um número no parâmetro, a função irá retornar NaN. Dessa forma dá pra ver se foi passado um número ou não usando a função isNaN(variavel).
    
    Cuidado com SQL injection. Se um argumento String passar daqui contendo um "; ALTER TABLE ... --" etc, o código injetado irá rodar no banco.
  */
  if(typeof parteNome == 'undefined' || parteNome == ""){
    // Tenha certeza de que está retornando o código HTTP certo.
    // Nesse caso, 400 representa "Requisição Inválida"
    res.status(400);
    res.send('Parâmetros inválidos.');
    return; // Necessário usar return depois de usar .send, pois se não o Node assume que deu tudo certo, que nada foi enviado ainda e tenta usar .send denovo, o que dá erro.
  }
  
  // Última parte: faça a consulta do PostgreSQL.
  /*
    Todas as tabelas e funções atualmente disponíveis estão descritas no arquivo database.sql.
    Se o método que você estiver fazendo não tiver uma função do postgres equivalente ainda, escreva um nome de qualquer forma que quando a função for criada, usará o mesmo nome que você deu.
    Ex: select * from buscarLojaPorId($1) as loja

    Todas as consultas são feitas do mesmo jeito, e nada do código precisa ser alterado exceto a consulta SQL e as variáveis no array depois da vírgula:
    usa-se db.one por que o Postgres sempre retorna uma linha
    e a função é chamada usando select * from nomedaFuncao(argumentos) as lojas/loja/resultados/historicos/etc.

    Para passar os argumentos, use $1, $2, $3, etc e então adicione a variável na posição certa no array depois da vírgula:
    
  */
  db.one('select * from buscarLojasPorNome($1) as resultados', [parteNome])
    .then(function (data) { // Roda se o sql foi executado com sucesso
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });
  
}
```

Em App.js
```javascript
 Após fazer o método em queries.js, adicione uma linha router.get ou post('uri', db.<nomedasuafuncao>)
 Exemplos:
 //Rest
  router.get('/api/lerListaLojas', db.getPaginaLojasCompletas);
  router.get('/api/lerListaHistorico', db.getPaginaHistoricos);
  router.get('/api/buscarLojasPorNome', db.getLojasMinimasPorNome);
 */
```

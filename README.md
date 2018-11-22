# PeçaPreçoRest

agora em node.js!

Exemplo de método rest:

```javascript
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
    Se uma variável obrigatória não for fornecida, o tipo dela vai ser 'undefined'. Então dá pra usar typeof variavel == undefined pra saber se uma variável foi passada.
    Não dá pra permitir uma variável numérica receber letras também. Nesse caso, ao usar variavel = parseInt(parâmetro), se o parseint não achar um número no parâmetro, a função irá retornar NaN. Dessa forma dá pra ver se foi passado um número ou não usando a função isNaN(variavel).

    Não exagere muito nisso e nem se preocupe com SQL injection.
  */
  if(typeof parteNome == 'undefined' || parteNome == ""){
    // Tenha certeza de que está retornando o código HTTP certo.
    // Nesse caso, 400 representa "Requisição Inválida"
    res.status(400);
    res.send('Parâmetros inválidos.');
    return;
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
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });
  
}
```
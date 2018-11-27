var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var router = express.Router();

var db = require('./routes/queries');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Cors
app.use(cors());

app.use('/', router);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//Rest
app.options('*', cors());
router.get('/api/lerListaLojas', db.getPaginaLojasCompletas);
router.get('/api/lerUsuarioPorSessao', db.getUsuarioSessao);
router.get('/api/lerListaHistorico', db.getPaginaHistoricos);
router.get('/api/buscarLojasPorNome', db.getLojasMinimasPorNome);
router.get('/api/buscarLojasCompletasPorNome', db.getPaginaLojasCompletasPorNome);
router.get('/api/lerLojaPorId', db.getLojaCompleta);
router.get('/api/lerCarroUsuario', db.getCarroUsuario);
router.post('/api/registrarHistorico', db.postCriarHistorico);
router.post('/api/login', db.postCriarSessao);
router.post('/api/registrarUsuario', db.postCriarUsuario);
router.post('/api/registrarCarroUsuario', db.postCriarCarroUsuario);
//router.post('/api/uploadHistorico', db.postUploadHistorico);


//Exports
module.exports = app, router;





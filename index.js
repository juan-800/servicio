const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userModel = require('./model');
const bodyParser = require('body-parser');
const session = require('express-session');

// Conexión a la base de datos
mongoose.connect('mongodb://127.0.0.1:27017/tienda_bd')
    .then(() => console.log("Base de datos conectada....."))
    .catch((error) => console.log(error));

// Configuración de sesiones
app.use(session({
    secret: "Este es el acceso",
    resave: false,
    saveUninitialized: false
}));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Servir favicon.ico
app.use('/favicon.ico', express.static('public/favicon.ico'));

// Middleware para manejar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar el motor de plantillas
app.set('view engine', 'ejs');

// Rutas
app.get('/', function (req, res) {
    res.render('login');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/signup', function (req, res) {
    res.render('signup');
});


app.post('/signup', async (req, res) => {
    const user = await userModel.findOne({ email: req.body.email });

    if (user) {
        res.send("<h1>El email ingresado ya existe</h1>");
    } else {
        const newUser = new userModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        newUser.save()
            .then(() => res.redirect('/login'))
            .catch((error) => console.log(error));
    }
});

app.post('/login', async (req, res) => {
    const user = await userModel.findOne({ email: req.body.email });

    if (user) {
        const result = req.body.password === user.password;
        if (result) {
            req.session.loggdin = true;
            res.redirect('/dashboard');
        } else {
            res.send("<h1>La contraseña no coincide</h1>");
        }
    } else {
        res.send("<h1>El usuario no existe</h1>");
    }
});

app.get('/dashboard', function (req, res) {
    if (req.session.loggdin) {
        res.render('dashboard');
    } else {
        res.send("<h1>Inicie sesión para acceder a esta página</h1>");
    }
});

app.get('/logout', function (req, res) {
    if (req.session.loggdin) {
        req.session.destroy();
        res.redirect('/login');
    }
});

// Iniciar servidor
app.listen(3000, function () {
    console.log("Servidor corriendo en http://localhost:3000");
});

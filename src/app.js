// 1) MODULOS DE TERCEROS: Importando los frameworks y Modulos completos 
import express from 'express' // MODULOS DE TERCEROS
import handlebars from 'express-handlebars' // MODULOS DE TERCEROS
import hbs from 'handlebars'
import mongoose from 'mongoose' // MODULOS DE TERCEROS - para interactuar con el motor MongoDB
import { Server } from 'socket.io' // MODULOS DE TERCEROS - para trabajar con Websokect
import http from 'http'// MODULOS DE TERCEROS - habilitamos el modulo http de NodeJs para hacer el CRUD con sokect.io 


// 2) Importando Rutas Estaticas
import { __dirname } from './utils.js' // MODULOS PROPIOS - Para el Manejo de Rutas Estaticas


// 3) Importando Rutas Dinamicas
import viewsRouter from './routes/views.routes.js' // MODULOS PROPIOS - Ruta para el Manejo de Plantilla handlebars
import productsRouter from './routes/products.routes.js'// MODULOS PROPIOS - Ruta para el Manejo de products
import cartsRouter from './routes/carts.routes.js'// MODULOS PROPIOS - Ruta para el Manejo de carts
 
// 4) Creando la Constante PORT(Puerto) y Asignandole un puerta Conectar
const PORT = 5000


// 5) Conectando con el Motor de Base de Datos de MONGODB (MONGO COMPAS)
// 5.1) Conectando con la BD Local - MONGO COMPAS
const MONGOOSE_URL = 'mongodb://127.0.0.1:27017/ecommerce'
// 5.2) Conectando con la BD Remota en la NUBE - MONGO ATLAS
//const MONGOOSE_URL = 'mongodb+srv://Admin_Jean:coder_55605@cluster0.zqatydb.mongodb.net/ecommerce'


// 6) Creando un Array Vacio para guardar los mensajes enviados por el socketClient 
// Guarda todos los mensaje(Objetos) cargados desde la plantilla chat.handlebars enviados por TODOS los clientes conectados al chat 
const message_load = []


// 7) Encapsulamos todo en un Try/Catch
try {

    // 7.1) Intentamos conectar con el Motor de BD de MongoDB (funciona para Remoto y Local)
    await mongoose.connect(MONGOOSE_URL)

    // 7.2) Inicializando Express 
    // Nota: express solo nos devuelve un Objeto aplication y no Objeto http
    const app = express() // INICIALIZACION PRINCIPAL 

    // 7.3) Habilitaciones para poder Servir Contenidos Express y de webSocket
    // - Permitiendo hacer C.R.U.D.con Sokect.io
    // - Creamos la Constante Server y Habilito el Modulo http de Nodejs, uso el motodo createServer()
    // - y le paso como parametro el Servidor de Express "app" 
    // - asi habilita para trabajar con protocolos http Nativos de Node.js y con el Modulo express()
    const server = http.createServer(app) // Creo un Modulo http y le paso Express/app como parametro 

    // 8) Poniendo a Escuchar el servidor de Express y el Modulo http de Node
    // IMPORTANTE: Ahora podemos Servir Ambos Contenidos Tanto de Express y de webSocket al mismo tiempo 
    server.listen(PORT, () => { console.log(`Backend activo puerto ${PORT} conectado a BBDD`) })

    // 9) Creando una nueva instacia del Socket.io y la pasamos "server" como parametro 
    // Ahora el Tendra dentro de socketServer estan TODAS configuraciones de los Modulos Express y http de Nodejs
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
            credentials: false
        }
    })

    // 10) Ponemos al Servidor de socket a escuchar conexiones
    // Nota: Una vez puesta la ruta http://localhost:5000/chat en el navegador
    //socket.io hace conexion automatica Siempre(ApretonDeManos), inclusive si el servidor de express se corta
    
    io.on('connection', socket => {

        // Aca estoy mostrando el ID del Socket-cliente conectado  
        console.log(`nuevo cliente Conectado ID: ${socket.id} `)


        // 11) PRIMER ESCUCHADOR DEL SERVIDOR ----
        // Aca recibimos La Notificacion del CLIENTE que se CONECTO un nuevo usuario
        // bajo el topico 'user_authenticate' en el parametro 2 recibimos el objeto con el dato(nombre) del  NUEVO CLIENTE Conectado y lo procesamos con una callback
        socket.on('client:user_authenticate', data => {
            
            // Verificando el usuario que se conecto y me enviaron del cliente
            //console.log(data)

            // Enviando a TODOS los clientes conectados que se Conecto un NUEVO usario al Chat 
            // - Opcion 2 Comunicacion de Servidor al Cliente (emite a todos menos al que envio el topico)
            // mandamos por el parametro 2 el Objeto con el dato(Nuevo Usuario Conectado)
            socket.broadcast.emit('server:broadcast_all', data)

        })

        
        // 12) SEGUNDO ESCUCHADOR DEL SERVIDOR ----
        // Nota: Aca estamos Escuchando un Evento
        socket.on('client:chat_message', async data => {

            // Paso 1: Aca mostramos la Data que recibimos del socketClient
            console.log(data)

            //Guardando en un array todos los productos recibido del 'client:message'
            message_load.push(data)
            
            //Paso 2: Enviamos repuesta de confirmacion a TODOS LOS CLIENTES INCLUYENDO el que envió el mensaje message
            // Nota: Aca estamos ejecutano el Evento .emit (emitir - enviar)
            io.emit('server:messageLogs', message_load)
            
            
        })


    })


    // 13) Habilitadon a Express para manejar paquetes json correctamente
    app.use(express.json())

    // 14) Habilitando a express para trabajar con urls (peteciones con res y req)
    app.use(express.urlencoded({ extended: true }))

    // 15) Habilitando/Inicializando el modulo HANDLEBARS
    app.engine('handlebars', handlebars.engine())
    app.set('views', `${__dirname}/views`)
    app.set('view engine', 'handlebars')
    hbs.registerHelper('eq', (a, b) => a === b)

    // 16) Inicializando Las Rutas para la API
    app.use('/', viewsRouter) // Para el Manejo de Plantilla index.handlebars 
    app.use('/api/carts', cartsRouter) // Para la coleccion carts
    app.use('/api/products', productsRouter) // Para la coleccion products

    
    // 17)RUTAS ESTATICAS para mostrar del lado del cliente los contenidos Estaticos que estan en la carpeta PUBLIC
    app.use('/static', express.static(`${__dirname}/public`)) 

} catch (err) {

    // Manejando el Error 
    console.log(`No se puede conectar con el servidor de bbdd (${err.message})`)

}
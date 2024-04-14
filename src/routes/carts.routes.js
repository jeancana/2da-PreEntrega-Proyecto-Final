
// ************* PAQUETE DE RUTAS PARA LA API DE Carritos (api/carts) ********************

// Aca vamos a Preparar el CRUD para las rutas del Archivo carts.routes.js

// Vamos a Tener 5 rutas para manejar carts: 
// 1) Crear un cart en la BD
// 2) Leer/Consultar todos los carts de la BD 
// 3) Leer/Consultar un(1) cart de la BD 
// 4) Actualizar un(1) cart de la BD
// 5) Borrar un(1) cart de la BD

// ********* C.R.U.D DE carritos ************

// 3 Pasos basicos para Intregar y Poder Usar carts.controllers.mdb.js EN carts.routes.js 
// Paso Nro1: importar el controlador
// Paso Nro2: Generar un nueva Instancia del controlador
// Paso Nro3: Usar los Metodo importados de la carpeta Controller que Necesite

import { Router } from 'express'

//Paso 1: Importando la clase products.controllers.mdb.js  
// Esta Importacion funciona para: Persistencia de Archivos con MongoDB
// Estamos importando la Clase que CartControlle contiene los metodos
import { CartController } from '../controllers/cart.controller.mdb.js'
import Product from '../models/Product.model.js'

const router = Router()

// Paso 2: Generando una nueva Intanscia - Persistencia de Archivos con MongoDB
const controller = new CartController()

// ******** CREANDO el C.R.U.D y Usanso los Metodos Importados del Archivo cart.controller.mdb.js  *************

// Nota: Fortalecimos el Codigo agregando try/catch en todas las rutas y respetamos los codigos de Estado

// *** 1.1) Read - Endpoint para leer/Consultar todos los Carritos Existentes en la DB - Con POSTMAN
router.get('/', async (req, res) => {

    try {

        const result = await controller.getCarts()
        //console.log('result', result)

        // Aca Mandamos la respuesta al cliente con el listado de productos encontrados en BD
        res.status(200).send({ status: 'OK. Mostrando Listado de Carritos', data: result  })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})


// *** 1.2) Read - Endpoint para leer/Consultar Un(1) Carrito por su ID en BD - Con POSTMAN
router.get('/:cid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID)  
        //console.log(cid)

        // Paso 3: Usando el Metodo .getCartById() disponible en archivo cart.controller.mdb.js
        const result = await controller.getCartById(cid)

        // Aca Mandamos la respuesta al cliente con el Carrito encontrado 
        res.status(200).send({ status: 'Ok. Mostrando Carrito Selecionado ', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/carts/65e787d710568c4965598bf0

}) 


// *** 2) Create - Endpoint para Crear un Nuevo Carrito de productos Vacio o Con productos- Con POSTMAN  
router.post('/', async (req, res) => {
    
    //console.log('aca2',req.body.products)// Verificando lo que viene por el body
    
    const products = req.body.products // Asignando lo que viene por body a una constante
    
    //console.log(products, Array.isArray(products))

    // Verificamos y sino mandan nada por el Body Creamos un carrito vacio 
    if (!Array.isArray(products)) {

        try {

            const newContent = {
                products: [ ]
            }

            const result = await controller.addCart( newContent )

            return res.status(201).send({ status: 'ok - Carrito Vacio Creado', data: result })

        } catch (err) {

            res.status(500).send({ status: 'ERR', data: err.message })

        }

    } else { 

        // Validando los Datos Antes de Crear el carrito los ID's y Cantidad del Producto    
        if (products && Array.isArray(products)) {

            for (let i = 0; i < products.length; i++) {
                const { producto, cantidad } = products[i]

                // Validate product
                try {
                    const product = await Product.findById(producto)
                    
                    // Validate positive quantity
                    if (cantidad < 1) {
                        return res.status(400).send({ status: 'BAD REQUEST', data: `Cantidad must be greater than 1` })
                    }

                    if (cantidad > product.stock) {
                        return res.status(400).send({ status: 'BAD REQUEST', data: `Cantidad must be less than ${product.stock}` })
                    }
                } catch {
                    return res.status(400).send({ status: 'BAD REQUEST', data: `Product ID not found: ${producto}` })
                }
            }
            
            try {

                // Paso 3: Usando el Metodo .addProduct() disponible en archivo product.controller.mdb.js

                const result = await controller.addCart({ products })

                // Aca Mandamos la respuesta al cliente
                return res.status(200).send({ status: 'OK. Carrito Creado', data: result })

            } catch (err) {

                res.status(500).send({ status: 'ERR', data: err.message })

            }
        }


    }
    
})


// *** 3) Update - Endpoint par Actualizar los productos a un Carrito en la DB - Con POSTMAN
router.put('/:cid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid } = req.params

        // Chequeando Datos Llegados del Cliente
        //console.log(cid)
        //console.log(req.body.products)

        const products = req.body.products
        //console.log(products)

        
        // Desestructuramos el req.body 
        if (products && Array.isArray(products)) {

            // Verificando que esta dentro de newContent
            //console.log(newContent)

            //Paso 3: Usando el Metodo .updateCart() disponible en archivo product.controller.mdb.js
            const result = await controller.updateCart(cid, { products: products } )
    
            // Aca Mandamos la respuesta al cliente
            res.status(200).send({ status: 'OK. Product Updated', data: result }) 
            

        }


    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 4) Update - Endpoint para Actualizar SOLO la Cantidad de un Producto agregado al Carrito - Con POSTMAN
router.put('/:cid/products/:pid', async (req, res) => {

    try {

        const productsToAct = req.body.products // Importante Debo Validar que es un Array 
        console.log(req.body.products)
        //console.log('Array.isArray(productsToAct)', Array.isArray(productsToAct))// Verificando si es un Array


        // Sino es un Array NO sigas Corta 
        if (!Array.isArray(productsToAct)) {
            return res.status(400).send({ status: 'ERR1', data: 'Data Is Not a Array' })
        }
        

        // Desestructuramos lo que nos llega req.params
        const { cid, pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID)
        //console.log('cid',cid)
        console.log('pid',pid)

        // Verificamos y Validamos los valores recibidos
        if (!cid || !pid) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }


        // Usando el Metodo .getCartById() para encontar el carrito
        const cart = await controller.getCartById(cid)
        //console.log('cart',cart)


        // Desestructuramos el Carrito encontrado
        const { id, products, total } = cart
        //console.log('id', id)
        //console.log('products', products)
        //console.log('total', total)


        // Sino es un Array NO sigas Corta 
        if (!Array.isArray(products)) {
            return res.status(400).send({ status: 'ERR2', data: 'Data Is Not a Array' })
        }
        // Verificando que el contenido de "products"
        //console.log('Array.isArray(products)', Array.isArray(products))// Verificando si es un Array

        
        // Buscando si Existe un producto con ese ID dentro del Carrito 
        const findPrdOncart = products.find(item => item.product.id == pid)
        //console.log('findPrdOncart', findPrdOncart)


        // Si existe el Producto el Producto dentro del Carrito Actualizo si cantidad
        if (findPrdOncart) {

            
            //Paso 3: Usando el Metodo .updateCart() disponible en archivo product.controller.mdb.js
            const result = await controller.updateCart(cid, { products: productsToAct })

            // Aca Mandamos la respuesta al cliente
            res.status(200).send({ status: `OK. Product Updated On Cart ID: ${cid}`, data: result }) 


        } else {

            // Aca Mandamos la respuesta al cliente
            res.status(400).send({ status: `Can Not UpDate Producto on Cart:${cid}`, data: err.message })

        }
   

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 5) Delete - Borrando todo los Productos del Carrito (dejando el carrito vacio) de la DB - Con POSTMAN
router.delete("/:cid", async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params
        const { cid } = req.params
    
        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
        console.log(cid)

        const newContent = {

            products: [],
            total: ' '

        }

        // Paso 3: Usando el Metodo .deleteProductById() disponible en archivo product.controller.mdb.js
        const result = await controller.updateCart(cid, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Cart Deleted', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})


// *** 6) Delete - Endpoint para Borra un Producto agregado al Carrito - Con POSTMAN
router.delete('/:cid/products/:pid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid, pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID)
        //console.log(cid)
        //console.log(pid)

        // Verificamos y Validamos los valores recibidos
        if (!cid || !pid) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }

        
        // Usando el Metodo .getCartById() para encontar el carrito
        const cart = await controller.getCartById(cid) 
        //console.log('cart',cart)

        // Desestructuramos el Carrito encontrado
        const {id , products, total} = cart
        
        // Verificando el contenido de "products"
        console.log('_id', id)
        console.log('products', products)
        console.log('total', total)
        console.log(Array.isArray(products))// Verificando si es un Array 


        // Eliminando un producto del carrito
        const deleteProductoOncart = products.filter(item => item.product.id !== pid)
         
        // Creamos un Nuevo Array con los productos que NO fueron eliminados del carrito
        const newContent = {

            _id: id,
            products: deleteProductoOncart,
            total: total

        }
        
        // Verificando el nuevo contenido del Array
        console.log(newContent)
        
        // Pisando el Carrito Viejo por uno nuevo con los productos que no fueron eliminados 
        const result = await controller.updateCart(cid, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: `OK. Product Deleted On Cart ID: ${cid}`, data: result})

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})



export default router





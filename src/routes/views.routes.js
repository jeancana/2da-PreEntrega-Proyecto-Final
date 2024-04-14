import { Router } from 'express'
import { ProductsController } from '../controllers/product.controller.mdb.js'
import { CartController } from '../controllers/cart.controller.mdb.js'

const router = Router()
const prdController = new ProductsController()
const cartController = new CartController()

// Aca SOLO habilitamos un endpoint /chat para probar el chat websockets
// Tenemos un solo endpoint que renderiza la plantilla /chat
router.get('/chat', (req, res) => {

    // Renderizando la plantilla /chat
    res.render('chat', {
        title: 'Chat BackendCoder'
    })

    // http://localhost:5000/chat

})


// Vista para Renderiza  TODOS los Productos Paginados 
router.get('/products', async (req, res) => {

    //console.log(req.query)
    
    const { page } = req.query;
    //console.log('page',page)

    // Trayendo los productos Paginados 
    const products = await prdController.getProducts(10, page)

    //console.log("products.totalPages",products.totalPages)

    // Evitando que el paginado Sea incorrecto antes de renderizar los productos
    // NO se permite page con valores Negativos
    // NO se permite page mayores al total de la pagina existentes
    // NO se permite que lleguen String por el req.query
    if ( page> 0 && page <= products.totalPages ) {
        
        // Esto es un ejemplo para entender el metodo Array.from()
        //console.log(Array.from({ length: 5 }, ( _, i) => i ))

        // Renderizando la plantilla 
        res.render('productList', {

            title: 'List Products',
            cartId: '',
            products: products.docs,
            pagination: {
                prevPage: products.prevPage,
                nextPage: products.nextPage,

                // Uso Metodo Array.from() 
                // toma dos argumentos: el objeto iterable (el objeto con la propiedad length) y una función de mapeo opcional.
                // Requiere requiere como minimo un parametro { length: "N" } para funcionar
                // Aqui se convierte un numero N a un arreglo [1,...,N]
                pages: Array.from({ length: products.totalPages }, (_, i) => i + 1),
                page: products.page,

            }

        })

    } else {
    
        res.status(400).send({

            status: 'ERR',
            data: `Pages Not Exits/ Error on route http://localhost:5000//products/?page=${page}`

        })

    }

})


// Vista para Renderizar un Carrito Especifico y Mostras los productos incluidos dentro del Carrito
router.get('/carts/:cid', async (req, res) => {

    //console.log(req.query)
   
    // Desestructuramos lo que nos llega req.params
    const { cid } = req.params
    //console.log("aca", { cid })

    const cart = await cartController.getCartById(cid)

    //console.log("cart.products", cart.products)

    
    // Renderizando la plantilla 
    res.render('carts', {

        title: 'Unique Cart',
        cartId: cart.id,
        products: cart.products,
        total: cart.total
    
    })

})

export default router



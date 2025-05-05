import express from 'express' // import express module from express
import fs from 'fs' //import file system module fs
 
const app = express() //create an express application

const port = 3000 //define a port 

app.use(express.json()); // to parse JSON bodies


const filePath = './data/data.json'

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))


//show all the products
app.post('/details', (req, res) => { 
    const {name, age, email } = req.body 
    res.send(`Hello ${name}. Your Email is : ${email} and your age is ${age}`)
    //another way of sending the response in the form of json
    // res.json ({message : `Hello ${name}`, email, age})
})


//defining route parameters
app.get('/details/:id', (req, res) => {
    const userId = req.params.id;  // :id becomes req.params.id
    res.send(`User ID is: ${userId}`)
})

//sample route to check for id in the url and get the specific json from the data.json file
app.get('/product/:id', (req, res) => {
    const productID = parseInt(req.params.id)
    const product = data.find(item => item.id === productID)

    if(product) {
        res.json(product)
    }
    else {
        res.status(404).send("Product Not Found!")
    }
})

//simple functionality for searching by name
app.get('/search', (req, res) => {
    const nameQuery = req.query.name?.toLowerCase()

    if(!nameQuery){
        return res.status(404).send(`Please provide a valid 'name' to search!`)
    }
    const result = data.filter(item => item.name.toLowerCase().includes(nameQuery))

    if(result.length > 0){
        return res.json(result)

    }
    else {
        return res.status(404).send(`No products found with that name!`)
    }
})

//add the product to the data.json file using postman or web thingy
app.post('/add', (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const {name, details} = req.body
    const highestID = data.reduce(function(maxID, product){
        if(product.id > maxID){
            return product.id
        }
        return maxID
    }, 0)
    const newID = highestID + 1

    //check if all the fields are valid
    if(!name || !details){
        res.status(400).send(`Please enter all the required fields!`)
    }

    //make sure that the id is unique
    const isIdUnique = true
    for(let i = 0; i<data.length;i++){
        if(data[i].id === newID){
            isIdUnique = false
            break
        }
    }
    if(!isIdUnique){
        res.status(400).send(`Please make sure that the ID is unique`)
    }

    //add the product to the already existing array
    const newProduct = {
        id : newID,
        name : req.body.name,
        details : req.body.details
    }

    data.push(newProduct)

    //add the changes to the JSON file
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {//this makes the format into string, 2 is the indent
        if(err){
            res.status(500).send(`Failed to save the data!`)
        }
        res.status(200).send(`Successfully saved the data!`)
    })
}) 


// remove the product using the id
app.delete('/delete/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const productID = parseInt(req.params.id)
    const product = data.find(item => item.id === productID)

    if(!product){
        res.status(400).send(`Please enter a valid ID`)
    }
    
    const result = data.filter(item => item.id !== productID)
    
    fs.writeFile(filePath, JSON.stringify(result, null, 2), (err) => {
        if(err){
            res.status(500).send(`Failed to perform the operation`)
        }
        res.status(200).send(`Successfully removed the Product`)
    })

})

//update the product using product id 
app.put('/update/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const product = data.find(products => products.id === parseInt(req.params.id))
    if(!product){
        return res.status(400).send(`Product Not Found`)
    }
    const {name, details} = req.body
    product.name = name || product.name
    product.details = details || product.details
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if(err){
            return res.status(500).send(`Failed to update the product.`)
        }

        res.status(200).send(`Successfully updated the Product.`)
    })
})



//start the server
app.listen(port, () => {
    console.log(`The server is running at ${port}...`)
})
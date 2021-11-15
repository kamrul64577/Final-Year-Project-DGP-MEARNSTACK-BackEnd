const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient, Admin } = require('mongodb');
const port = process.env.PORT || 5000;









// Middlewear
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ib20y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)




async function run() {
    try {
        await client.connect();
        const database = client.db('Shome_Shoes');
        const userCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        app.get('/products/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.json(result);
        })

        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            res.json(result)
        });

        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.json(result)
        });

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.json(order);
        })


        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.json(result)
        });


        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await userCollection.insertOne(order);
            res.json(result);
            console.log(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
            console.log(result);
        })

        // DELETE API 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result)
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(query);
            res.json(result)
        })

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrders = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedOrders.title,
                    price: updatedOrders.price
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            // console.log('updating', id)
            res.json(result)
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProducts = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedProducts.title,
                    price: updatedProducts.price,
                    description: updatedProducts.description
                },
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            // console.log('updating', id)
            res.json(result)
        })

        app.put('/users', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // app.put('/orders/approved', async (req, res) => {
            
        //     const updateDoc = { $set: { status: 'Approved' } }
        //     const result = await ordersCollection.updateOne(updateDoc);
        //     res.json(result);
        // })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Shome Cars!')
})

app.listen(port, () => {
    console.log(` listening ${port}`);
})
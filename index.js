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
        const database = client.db('DGP');
        const userCollection = database.collection('users');
        const repairCollection = database.collection('repair');
        const requestServiceCollection = database.collection('requestService');
        const serviceCollection = database.collection('service');
        const newsCollection = database.collection('news');
        const eventCollection = database.collection('event');
        const registerEventCollection = database.collection('registerEvent');
        const bookingCollection = database.collection('booking');
        const birthCollection = database.collection('birth');
        const deathCollection = database.collection('death');
        

        // Users And Users Role 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
            console.log(result);
        });

        app.put('/users', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.put('/users/localJournalist', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'journalist' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        app.put('/users/serviceOfficer', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'serviceofficer' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        app.put('/users/eventCoordinator', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'eventCoordinator' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            if (user?.role === 'journalist') {
                res.json('journalist')
            }
            if (user?.role === 'admin') {
                res.json('admin')
            }

            if (user?.role === 'serviceofficer') {
                res.json('serviceofficer')
            }
            if (user?.role === 'eventCoordinator') {
                res.json('eventCoordinator')
            }
            

        });



        //Repairing Post API
        app.post('/insertRepair', async (req, res) => {
            const repair = req.body;
            const result = await repairCollection.insertOne(repair);
            res.json(result);
            console.log(result);
        });


        //Services Post API

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
            console.log(result);
        });
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const service = await cursor.toArray();
            res.json(service);
        })
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const updatedServices = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedServices.name,
                    categories: updatedServices.categories,
                    description: updatedServices.description
                },
            };
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            // console.log('updating', id)
            res.json(result)
        })
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.json(result)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.json(result)
        })



        // Request Service API 
        app.post('/insertRequestService', async (req, res) => {
            const requestService = req.body;
            const result = await requestServiceCollection.insertOne(requestService);
            res.json(result);
            console.log(result);
        });

        app.get('/requestServices', async (req, res) => {
            const cursor = requestServiceCollection.find({});
            const requestService = await cursor.toArray();
            res.json(requestService);
        })
        app.delete('/requestServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await requestServiceCollection.deleteOne(query);
            res.json(result)
        })



        // RequestRepairing Api 
        app.get('/requestRepairing', async (req, res) => {
            const cursor = repairCollection.find({});
            const requestRepairing = await cursor.toArray();
            res.json(requestRepairing);
        })
        app.delete('/requestRepairing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await repairCollection.deleteOne(query);
            res.json(result)
        })



        // News API 
        app.get('/news', async (req, res) => {
            const cursor = newsCollection.find({});
            const news = await cursor.toArray();
            res.json(news);
        });
        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await newsCollection.findOne(query);
            res.json(result)
        })
        app.post('/insertNews', async (req, res) => {
            const news = req.body;
            const result = await newsCollection.insertOne(news);
            res.json(result);
            console.log(result);
        });
        app.put('/news/:id', async (req, res) => {
            const id = req.params.id;
            const updatedNews = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedNews.title,
                    image: updatedNews.image,
                    description: updatedNews.description
                },
            };
            const result = await newsCollection.updateOne(filter, updateDoc, options);
            // console.log('updating', id)
            res.json(result)
        })
        app.delete('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.json(result)
        });

        // Event API 
        app.get('/event', async (req, res) => {
            const cursor = eventCollection.find({});
            const event = await cursor.toArray();
            res.json(event);
        });
        app.post('/event', async (req, res) => {
            const event = req.body;
            const result = await eventCollection.insertOne(event);
            res.json(result);
            console.log(result);
        });
        app.get('/event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await eventCollection.findOne(query);
            res.json(result)
        })
        app.delete('/event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await eventCollection.deleteOne(query);
            res.json(result)
        });

        // Register Event API
        app.get('/registerEvent', async (req, res) => {
            const cursor = registerEventCollection.find({});
            const event = await cursor.toArray();
            res.json(event);
        });
        app.post('/registerEvent', async (req, res) => {
            const registerEvent = req.body;
            const result = await registerEventCollection.insertOne(registerEvent);
            res.json(result);
            console.log(result);
        });
        app.delete('/registerEvent/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await registerEventCollection.deleteOne(query);
            res.json(result)
        });





        // Booking Api 
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
            console.log(result);
        });
        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({});
            const event = await cursor.toArray();
            res.json(event);
        });
        app.put('/booking', async (req, res) => {
            const { id, updateStatus } = req.body;
            const query = { _id: ObjectId(id) };
            const order = await bookingCollection.findOne(query);
            if (order._id) {
                const filter = { _id: ObjectId(order._id) };
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        status: updateStatus,
                    }
                };
                const result = await bookingCollection.updateOne(filter, updateDoc, options);
                res.json(result);
            }
        });
         app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result)
        });


        // Birth Registration Api 
        app.get('/birth', async (req, res) => {
            const cursor = birthCollection.find({});
            const birth = await cursor.toArray();
            res.json(birth);
        });
        app.post('/birth', async (req, res) => {
            const birth = req.body;
            const result = await birthCollection.insertOne(birth);
            res.json(result);
            console.log(result);
        });
        app.delete('/birth/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await birthCollection.deleteOne(query);
            res.json(result)
        })


        // Death Registration Api 
        app.get('/death', async (req, res) => {
            const cursor = deathCollection.find({});
            const death = await cursor.toArray();
            res.json(death);
        });
        app.post('/death', async (req, res) => {
            const death= req.body;
            const result = await deathCollection.insertOne(death);
            res.json(result);
            console.log(result);
        });
        app.delete('/death/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await deathCollection.deleteOne(query);
            res.json(result)
        })

        
        

        
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
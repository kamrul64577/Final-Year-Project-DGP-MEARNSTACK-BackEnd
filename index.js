const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient, Admin } = require('mongodb');
const port = process.env.PORT || 5000;

const fileUpload = require("express-fileupload");

const SSLCommerzPayment = require('sslcommerz')
const { v4: uuidv4 } = require('uuid');





// Middlewear
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true }));

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
        const reliefCollection = database.collection('relief');
        const birthCollection = database.collection('birth');
        const deathCollection = database.collection('death');
        const orderCollection = database.collection('orders')

        // Paymentt Method SSL COMERZ START 
        // ssl commerge init 
        app.post('/init', async (req, res) => {
            const productInfo = {
                total_amount: req.body.total_amount,
                currency: 'BDT',
                tran_id: uuidv4(),
                success_url: 'https://dgp-final-project.web.app/success',
                fail_url: 'https://dgp-final-project.web.app/fail',
                cancel_url: 'https://dgp-final-project.web.app/cancel',
                ipn_url: 'https://dgp-final-project.web.app/ipn',
                paymentStatus: 'pending',
                shipping_method: 'Courier',
                product_name: req.body.product_name,
                product_category: 'Electronic',
                product_profile: req.body.product_profile,
                cus_name: req.body.cus_name,
                cus_email: req.body.cus_email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
                multi_card_name: 'mastercard',
                value_a: 'ref001_A',
                value_b: 'ref002_B',
                value_c: 'ref003_C',
                value_d: 'ref004_D'
            };

            // Insert order info
            const result = await orderCollection.insertOne(productInfo);

            const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, false) //true for live default false for sandbox
            sslcommer.init(productInfo).then(data => {
                //process the response that got from sslcommerz 
                //https://developer.sslcommerz.com/doc/v4/#returned-parameters
                const info = { ...productInfo, ...data }
                // console.log(info.GatewayPageURL);
                if (info.GatewayPageURL) {
                    res.json(info.GatewayPageURL)
                }
                else {
                    return res.status(400).json({
                        message: "SSL session was not successful"
                    })
                }

            });
        });

        app.post('/success', async (req, res) => {
            const result = await orderCollection.updateOne({ tran_id: req.body.tran_id }, {
                $set: {
                    val_id: req.body.val_id
                }
            })
            res.redirect(`https://dgp-final-project.web.app/success/${req.body.tran_id}`)
        })
        app.post('/fail', async (req, res) => {
            const result = await orderCollection.deleteOne({ tran_id: req.body.tran_id })
            res.status(400).redirect('https://dgp-final-project.web.app/')
        })
        app.post('/cancel', async (req, res) => {
            const result = await orderCollection.deleteOne({ tran_id: req.body.tran_id })
            res.status(200).redirect('https://dgp-final-project.web.app/')
        })

        app.post('/validate', async (req, res) => {
            const result = await orderCollection.findOne({
                tran_id: req.body.tran_id
            })

            if (result.val_id === req.body.val_id) {
                const update = await orderCollection.updateOne({ tran_id: req.body.tran_id }, {
                    $set: {
                        paymentStatus: 'paymentComplete'
                    }
                })
                console.log(update);
                res.send(update.modifiedCount > 0)

            }
            else {
                res.send("Chor detected")
            }

        })

        app.get('/orders/:tran_id', async (req, res) => {
            const id = req.params.tran_id;
            const result = await orderCollection.findOne({ tran_id: id })
            res.json(result)
        })

   
        // Paymentt Method SSL COMERZ END


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
        app.post("/insertNews", async (req, res) => {
            const title = req.body.title;
            const image = req.body.image;
            const description = req.body.description;
            // const picOne = req.files.profilepic;
            // const picDataOne = picOne.data;
            // const encodedPicOne = picDataOne.toString("base64");
            // const imageBufferOne = Buffer.from(encodedPicOne, "base64");

            const news = {
                title,
                image,
                description
            };
            const result = await newsCollection.insertOne(news);
            res.json(result);
        });

        // app.post('/insertNews', async (req, res) => {
        //     const news = req.body;
        //     console.log(req.files);
        //     const picOne = req.files.img;
        //     const picDataOne = picOne.data;
        //     const encodedPicOne = picDataOne.toString("base64");
        //     const imageBufferOne = Buffer.from(encodedPicOne, "base64");
        //     const result = await newsCollection.insertOne({news,imageBufferOne});
        //     res.json(result);
        //     console.log(result);
        //     console.log(result);
        // });
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

        // Relief scheduling
        app.get('/relief', async (req, res) => {
            const cursor = reliefCollection.find({});
            const relief = await cursor.toArray();
            res.json(relief);
        });
        app.post('/relief', async (req, res) => {
            const relief = req.body;
            const result = await reliefCollection.insertOne(relief);
            res.json(result);
            console.log(result);
        });
        app.delete('/relief/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reliefCollection.deleteOne(query);
            res.json(result)
        })


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
    res.send('Hello Digital Village!')
})

app.listen(port, () => {
    console.log(` listening ${port}`);
})
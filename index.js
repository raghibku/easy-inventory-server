const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pwytamz.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const dressCollection = client.db("inventory").collection('clothes');

        app.get('/allInventoryItems', async (req, res) => {
            const result = await dressCollection.find().toArray();
            res.send(result);
        })
        app.get('/singleInventoryItem/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(email)
            const query = { _id: new ObjectId(id) }
            const result = await dressCollection.findOne(query);
            res.send(result);
        })
        app.patch('/updateItem/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedItem = req.body;
            console.log(updatedItem);
            const updateDoc = {
                $set: {
                    name: updatedItem.item_name,
                    description: updatedItem.item_description,
                    quantity: updatedItem.item_quantity,
                    cost: updatedItem.item_cost,
                },
            };
            const result = await dressCollection.updateOne(filter, updateDoc);
            res.send(result);

        })
        app.patch('/orderItem/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const newOrder = req.body;
            console.log(newOrder);
            const existingDocument = await dressCollection.findOne(filter);
            const preQuantity = existingDocument.quantity;
            const latestQuantity = parseInt(preQuantity) + parseInt(newOrder.orderQuantity)
            console.log(latestQuantity)
            const updateDoc = {
                $set: {
                    quantity: latestQuantity,
                },
            };

            const result = await dressCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.get('/totalCost', async (req, res) => {
            const allItems = await dressCollection.find().toArray();
            // Calculate the total cost
            const result = allItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0).toString();
            res.send( result );
        })

        app.delete('/deleteItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dressCollection.deleteOne(query);
            res.send(result);
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {


    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('e-home server is running')
})

app.listen(port, () => {
    console.log('e-home server is running on port ', port)
})

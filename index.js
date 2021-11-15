const { MongoClient } = require('mongodb');

const express=require('express');
const ObjectId=require('mongodb').ObjectId;
const cors=require('cors');
require('dotenv').config();
const admin = require("firebase-admin");


const app=express();
const port=process.env.PORT || 5000;




//middleware
app.use(cors());
app.use(express.json());
 
//////////////////////////////


//////////connect to database////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjow1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}

///async function///

async function run(){
    try{
        await client.connect();
        console.log('connected to database'); //checked the connection
         
        const database=client.db('CYCOLO');
        const cycleCollection=database.collection('cycles');
        const orderCollection=database.collection('orders');
        const reviewCollection=database.collection('reviews');
        const usersCollection = database.collection('users');

        //GET API: GET ALL CYCLES DETAILS 
        app.get('/cycles',async(req,res)=>{
            const cursor=cycleCollection.find({});
            const cycles=await cursor.toArray();
            res.send(cycles);
        });
    
        //GET SINGLE CYCLE DETAILS
        app.get('/cycles/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const cycle=await cycleCollection.findOne(query);
            res.json(cycle);
        })
    
    
    
        //POST API : ADD CYCLE DETAIL ONE BY ONE 
        app.post('/cycles',async(req,res)=>{
            const cycle =req.body;
            const result=await cycleCollection.insertOne(cycle);
            res.json(result);
            
            
        });
    
    
        //POST FOR BOOKING A CYCLE 
        app.post('/purchase',async(req,res)=>{
            const order=req.body;
            const result=await orderCollection.insertOne(order);
            res.json(result);
            
        });
        //GET BY EMAIL BOOKING 
        app.get('/purchase',async(req,res)=>{
            const email = req.query.Email;
            const query = { Email: email};
            const cursor = orderCollection.find(query);
            const orders=await cursor.toArray();
            res.json(orders);
            
        });
        //POST FOR REVIEW 
        app.post('/reviews',async(req,res)=>{
            const review=req.body;
            const result=await reviewCollection.insertOne(review);
            res.json(result);
            
        });

         //GET API: GET ALL REVIEWS DETAILS 
         app.get('/reviews',async(req,res)=>{
            const cursor=reviewCollection.find({});
            const reviews=await cursor.toArray();
            res.send(reviews);
        });

        ///
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //////
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //////////////
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })
    }
    finally{
        // await client.close();
    }
    
    };
    
    run().catch(console.dir);













// check sever
app.get('/',(req,res)=>{
    res.send('Running cycolo Server');
});

app.listen(port,()=>{
    console.log('Server is on port',port);
});
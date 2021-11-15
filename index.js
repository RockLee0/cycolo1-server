const { MongoClient } = require('mongodb');

const express=require('express');
const ObjectId=require('mongodb').ObjectId;
const cors=require('cors');
require('dotenv').config();


const app=express();
const port=process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
 
//////////////////////////////


//////////connect to database////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjow1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


///async function///

async function run(){
    try{
        await client.connect();
        console.log('connected to database'); //checked the connection
         
        const database=client.db('CYCOLO');
        const cycleCollection=database.collection('cycles');
        const orderCollection=database.collection('orders');
        const reviewCollection=database.collection('reviews');
        

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
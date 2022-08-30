const express = require('express');
const {MongoClient} = require('mongodb');
const fastcsv = require("fast-csv");
const fs = require("fs");

//my connection, with my usename and password
const uri = "mongodb+srv://hezzi123:cloud123@cluster0.62876bz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const dbName = "airplanes"
const db = client.db(dbName);
const collection = db.collection("flights");


// Do i need it?
async function main() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log("Connected correctly to server"); 
    } catch (e) {
        console.error(e);
    }
}

// Here we insert the data to MongoDB
async function insertToMongo(msg){
    try{
        await client.connect();
        const p = await collection.insertOne(msg);
        console.log("inserted to MongoDB");
    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
};

// For BigML we convert the data in mongo to csv
async function mongoToCsv(){
    await client.connect();
     
    await collection.find({}).toArray((err, data) => {
        if (err) throw err;

        const ws = fs.createWriteStream("flightData.csv"); 
        fastcsv.write(data, { headers: true }).on("finish", function() {
            console.log("Written to flightData.csv successfully!");
          }).pipe(ws);
      });
};


module.exports = {MongoClient,
    insertToMongo ,
    mongoToCsv};
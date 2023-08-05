import { MongoClient } from 'mongodb'
import { config } from 'dotenv';

config();
const uri = process.env.DB_URI;

export async function connectToCluster(uri){
  let mongoC;
  try {
      mongoC = new MongoClient(uri);
     await mongoC.connect();

     return mongoC;
  } catch (error) {
     console.error('Connection to MongoDB Atlas failed!', error);
     process.exit();
  }
}

export async function saveWordScore(name, word, score){
  let mongoC;
    try {
        mongoC = await connectToCluster(uri);
        const db = mongoC.db('scrabble-database');
        const collection = db.collection('game-data');
        const data = {name, word, score};
        let count = await collection.countDocuments();
        if (count == 0){
          let scores = {id: 1, word: [data], game: []};
          await collection.insertOne(scores);
          console.log('Succesfully created word score and game score database!');
        }else{
          let newField = await getWordField();
          newField.push(data);
          await collection.updateMany(
            { id: 1 },
            { $set: {word: newField} }
          );
          console.log('Succesfully added word score!');
        }
        mongoC.close();
        return 0;
    } catch(err) {
        console.log(err);
    }
}

export async function saveGameScore(name, score){
  let mongoC;
    try {
        mongoC = await connectToCluster(uri);
        const db = mongoC.db('scrabble-database');
        const collection = db.collection('game-data');
        const data = {name, score};
        let count = await collection.countDocuments();
        if (count == 0){
          let scores = {id: 1, word: [], game: [data]};
          await collection.insertOne(scores);
          console.log('Succesfully created word score and game score database!');
        }else{
          let newField = await getGameField();
          newField.push(data);
          await collection.updateMany(
            { id: 1 },
            { $set: {game: newField} }
          );
          console.log('Succesfully added game score!');
        }
        mongoC.close();
        return 0;
    } catch(err) {
        console.log(err);
    }
}

export async function top10WordScores(){
  let mongoC;
  try {
      mongoC = await connectToCluster(uri);
      const db = mongoC.db('scrabble-database');
      const collection = db.collection('game-data');
      let arr = await collection.find().toArray();
      let word_arr = arr[0].word;
      const sorted = word_arr.sort((a, b) => b.score - a.score);
      const top = sorted.slice(0, 10);
      mongoC.close();
      return top;
  } catch (error) {
    console.log(error);
  } 
}

export async function top10GameScores(){
  let mongoC;
  try {
      mongoC = await connectToCluster(uri);
      const db = mongoC.db('scrabble-database');
      const collection = db.collection('game-data');
      let arr = await collection.find().toArray();
      let game_arr = arr[0].game;
      const sorted = game_arr.sort((a, b) => b.score - a.score);
      const top = sorted.slice(0, 10);
      mongoC.close();
      return top;
  } catch (error) {
    console.log(error);
  }
}


// Utility functions

export async function getWordField() {
  let mongoC;
  try {
      mongoC = await connectToCluster(uri);
      const db = mongoC.db('scrabble-database');
      const collection = db.collection('game-data');
      let arr = await collection.find().toArray();
      mongoC.close();
      return arr[0].word;
  } catch (error) {
   console.log(error);
  } 
}


export async function getGameField() {
  let mongoC;
  try {
      mongoC = await connectToCluster(uri);
      const db = mongoC.db('scrabble-database');
      const collection = db.collection('game-data');
      let arr = await collection.find().toArray();
      mongoC.close();
      return arr[0].game;
  } catch (error) {
   console.log(error);
  } 
}

export async function deleteAll(){
  let mongoC;
  try {
      mongoC = await connectToCluster(uri);
      const db = mongoC.db('scrabble-database');
      const collection = db.collection('game-data');
      await collection.deleteMany({});
      mongoC.close();
      return 0;
  } catch (error) {
   console.log(error);
  } 
}
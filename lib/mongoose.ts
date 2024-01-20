import mongoose from 'mongoose'
let isConnected = false


export const connectToDB = async() => {
    mongoose.set('strictQuery', true)
    if(!process.env.MONGO_URI) return console.log("Mongo URL not found")

    if(isConnected) return console.log("Already connected to mongo db")

    try {
        await mongoose.connect(process.env.MONGO_URI)

        isConnected = true
        console.log("Connected to Mongo DB")
    } catch (error) {
        
    }
}
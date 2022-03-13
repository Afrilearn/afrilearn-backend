import mongoose from 'mongoose';
import { config } from 'dotenv';
import logger from '../config';

config();

const url = process.env.ATLAS_URL;

mongoose.connect(url, {
  // autoIndex: false, // Don't build indexes
  // maxPoolSize: 10, // Maintain up to 10 socket connections
  // serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10s seconds
  // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // family: 4, // Use IPv4, skip trying IPv6
  // ssl: true,
  // sslValidate: false,
  // sslCA: "/secure/certificates/rootCA.pem",
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,

});
const { connection } = mongoose;

connection.once('open', () => {
  console.log('MongoDB database connected successfully');
});
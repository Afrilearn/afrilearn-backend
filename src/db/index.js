import mongoose from 'mongoose';
import { config } from 'dotenv';
import logger from '../config';

config();

const url = process.env.ATLAS_URL;

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const { connection } = mongoose;

connection.once('open', () => {
  logger.info('MongoDB database connected successfully');
});

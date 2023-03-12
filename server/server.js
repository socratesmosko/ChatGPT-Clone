import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client'));

const staticDir = path.resolve(`${process.cwd()}${path.sep}${path.sep}client`);
app.use('/public', express.static(staticDir));
  
app.get('/', async (req, res) => {
  res.render('index.ejs');
});

app.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${prompt}`,
      temperature: 0,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.5,
      presencePenalty: 0,
    });

    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    res.status(500).send('An error has occurred. Please verify that the API key being used is correct and functional to ensure proper system operation.');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`AI server started on http://localhost:${port}`));

export default app;

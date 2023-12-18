const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require("twilio")


const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


app.use(cors());
app.use(express.json());

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("fs");

const API_KEY = "AIzaSyCr2axQ-Q9HiwQvG0j5cG09_YS_1m9OWO8";
const genAI = new GoogleGenerativeAI(API_KEY);

const chatting = async (req, res) => {
    const { prompt } = req.body;
    console.log(prompt);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: "Who are you?",
                },
                {
                    role: "model",
                    parts: "I am MedSync, a virtual assistant powered by 4 college students. I'm here to help answer your medical questions and provide information on a wide range of topics. How can I assist you today?",
                },
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const msg = prompt.message;

        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, text });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

const imageocr = async (req, res) => {
    const { image } = req.body;
    console.log(image)


    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const generationConfig = {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
        };

        const parts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                }
            },
            // { text: `Analyse the prescription and return the correct values  for which medication to take for how many days and it's frequency per day and  can you respond with a structured format  ` },
            { text: `accurately and give the text in the image` },
        ];


        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });
        const response = result.response;

        const text = response.text();
        // reminder(text)
        // sendrem()
        res.json({ success: true, text });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

}




const medicationData = [
    {
      "startedDate": "2023-11-14T09:55:55.678Z",
      "days": 20,
      "prescriptionflg": 1,
      "brandName": "Azithromycin",
      "frequency": "1-0-1", 
      "visitEId": "",
      "patientEId": ""
    },
    {
      "startedDate": "2023-11-14T09:55:55.678Z",
      "days": 15, 
      "prescriptionflg": 1,
      "brandName": "Dolo",
      "frequency": "1-2-2", 
      "visitEId": "",
      "patientEId": ""
    },
    {
      "startedDate": "2023-11-14T09:55:55.678Z",
      "days": 25, 
      "prescriptionflg": 1,
      "brandName": "Paracetemol",
      "frequency": "1-0-1", 
      "visitEId": "",
      "patientEId": ""
    }
  ];



const sendrem =()=>{
    const accountSid = 'ACf27a6737f63349b5a3246b3558ab9a0c';
    const authToken = 'd93faeaa09e87cfa52c4f653a97b8a37';
    const client = require('twilio')(accountSid, authToken);
    
    try{
        client.messages
        .create({
            body: "",
            from: '+12059278102',
            to: '+919108289885'
        })
        .then(message => console.log(message.sid))
        .done();
    
    }catch (error) {
        // res.status(500).json({ success: false, error: error.message });
    }
}
    

const pdfocr = async (req, res) => {
    const { image } = req.body;


    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const generationConfig = {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
        };

        const parts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                }
            },
            { text: `give analysis of this medical report` },
        ];


        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });
        const response = result.response;

        const text = response.text();
        med()
        res.json({ success: true, text });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

}

app.post('/chat', chatting)
app.post('/img', imageocr)
app.post('/pdf', pdfocr)

app.get('/', (req, res) => {
    res.status(200).contentType('text/plain').send('Server shaddy Rep is healthy 😀🥳');
});



const med= ()=>{
    const apiUrl = "https://hackathon.hsdevonline.com/HS/mobile/V2/addMedicationDetails";
const token = "bearer e45edbc6-55e3-4792-b7d4-d9838dc621eb"; 



medicationData.forEach(data => {
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));
});


}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

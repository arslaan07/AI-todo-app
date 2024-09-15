const express = require('express')
const app = express()

const axios = require('axios')
const cors = require('cors')

app.use(cors())
app.use(express.json())

const OPEN_AI_KEY = process.env.OPEN_AI_KEY

app.post('/suggest-task', async(req, res) => {
    const { taskHistory } = req.body
    console.log({ taskHistory });
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
            model: "gpt-3.5",
            messages: [
                {
                role: 'system',
                content: "You are an AI that suggests tasks based on the user's previous task history."
            },
            {
                role: "user",
                content: `Here are the tasks I've completed: ${taskHistory}. Can you suggest a new task?`
            }
            ],
            max_tokens: 100,
        },
        {
            headers: {
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
                'Content-Type': 'application/json',
            },
        }
        )
        const suggestion = response.data.choices[0].message_content
        res.json({suggestion})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Error generating task suggestion'})
    }
})
app.get("/", (req, res) => {
    res.send("hello")
    console.log('Starting server ...')
})
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
import * as ai from '../services/ai.service.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query; // Get prompt from query string in URL 
        const result = await ai.generateResult(prompt); // Call the service function to get the result
        res.send(result); // Send the result back to the client
    } catch (error) { 
        res.status(500).send({ message: error.message });
    }
}


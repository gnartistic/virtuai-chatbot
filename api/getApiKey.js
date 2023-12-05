module.exports = (req, res) => {
    try {
        // Retrieve the token from the request headers
        const token = req.headers.authorization;

        // Check if the token is present and valid
        if (token && token === `Bearer ${process.env.AUTH_TOKEN}`) {
            // Send the OpenAI API key
            res.status(200).json({ apiKey: process.env.OPENAI_API_KEY });
        } else {
            // Unauthorized access
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

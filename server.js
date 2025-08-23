const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from the root directory

// Handle preflight requests
app.options('*', cors());

// Ensure submissions.json exists
async function initializeSubmissionsFile() {
    try {
        await fs.access(SUBMISSIONS_FILE);
    } catch (error) {
        // File doesn't exist, create it with an empty array
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
    }
}

// Handle form submission
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // Basic validation
        if (!formData.fullName || !formData.phone) {
            return res.status(400).json({ error: 'El nombre y el teléfono son campos obligatorios' });
        }

        // Validate phone number (9 digits)
        if (!/^[0-9]{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
            return res.status(400).json({ error: 'El número de teléfono debe tener 9 dígitos' });
        }

        // Validate email if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return res.status(400).json({ error: 'El correo electrónico no es válido' });
        }

        // Read existing submissions
        let submissions = [];
        try {
            const data = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
            submissions = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist or is invalid, start with empty array
            console.log('Creating new submissions file...');
            submissions = [];
        }
        
        // Create submission object with all form data
        const submission = {
            id: Date.now().toString(),
            fullName: formData.fullName.trim(),
            phone: formData.phone.replace(/\s+/g, ''),
            email: formData.email ? formData.email.trim() : '',
            address: formData.address ? formData.address.trim() : '',
            city: formData.city ? formData.city.trim() : '',
            postalCode: formData.postalCode ? formData.postalCode.trim() : '',
            propertyType: formData.propertyType || '',
            atticType: formData.atticType || '',
            privacyAccepted: Boolean(formData.privacyAccepted),
            timestamp: new Date().toISOString(),
            status: 'new',
            source: 'website-form'
        };
        
        // Add to submissions array
        submissions.push(submission);
        
        // Save to file
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
        
        // Log successful submission (without sensitive data)
        console.log(`New submission received from ${submission.fullName} (${submission.phone})`);
        
        // Send success response
        res.json({ 
            success: true, 
            message: '¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.'
        });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all submissions (for testing)
app.get('/api/submissions', async (req, res) => {
    try {
        const data = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the contact form
app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacto.html'));
});

// Start server
async function startServer() {
    await initializeSubmissionsFile();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Access the contact form at: http://localhost:${PORT}/contacto`);
    });
}

startServer().catch(console.error);

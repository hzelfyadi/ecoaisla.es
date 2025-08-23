const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

// Simple CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

// Ensure data file exists
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
        console.log('Data file exists');
    } catch (error) {
        console.log('Creating data file...');
        await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }
}

// Handle OPTIONS (CORS preflight)
function handleOptions(req, res) {
    res.writeHead(204, {
        ...corsHeaders,
        'Content-Length': '0'
    });
    res.end();
}

// Handle GET /api/status
function handleStatus(req, res) {
    const response = {
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(response));
}

// Handle POST /api/submit
async function handleSubmit(req, res) {
    let body = '';
    
    // Collect request data
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', async () => {
        try {
            const formData = JSON.parse(body);
            
            // Simple validation
            if (!formData.fullName?.trim()) {
                sendError(res, 400, 'fullName', 'El nombre completo es requerido');
                return;
            }
            
            if (!/^[0-9]{9}$/.test(formData.phone?.replace(/\s+/g, ''))) {
                sendError(res, 400, 'phone', 'Por favor, introduce un número de teléfono válido de 9 dígitos');
                return;
            }
            
            // Read existing data
            const data = await fs.readFile(DATA_FILE, 'utf8');
            const submissions = JSON.parse(data);
            
            // Add new submission
            const newSubmission = {
                id: Date.now(),
                fullName: formData.fullName.trim(),
                phone: formData.phone.replace(/\s+/g, ''),
                address: formData.address?.trim() || '',
                city: formData.city?.trim() || '',
                privacyAccepted: true,
                submittedAt: new Date().toISOString(),
                status: 'new'
            };
            
            submissions.push(newSubmission);
            await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
            
            console.log('New submission:', newSubmission);
            
            sendSuccess(res, '¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.');
            
        } catch (error) {
            console.error('Error processing submission:', error);
            sendError(res, 500, 'server', 'Error al procesar la solicitud');
        }
    });
}

// Helper function to send success response
function sendSuccess(res, message) {
    const response = { success: true, message };
    res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(response));
}

// Helper function to send error response
function sendError(res, status, field, message) {
    const response = { 
        success: false, 
        message,
        ...(field && { field })
    };
    res.writeHead(status, {
        ...corsHeaders,
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(response));
}

// Create server
const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return handleOptions(req, res);
    }
    
    // Route requests
    if (req.method === 'GET' && req.url === '/api/status') {
        return handleStatus(req, res);
    }
    
    if (req.method === 'POST' && req.url === '/api/submit') {
        return handleSubmit(req, res);
    }
    
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// Start server
async function start() {
    try {
        await ensureDataFile();
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://localhost:${PORT}/`);
            console.log('Endpoints:');
            console.log(`  GET  /api/status   - Check server status`);
            console.log(`  POST /api/submit   - Submit contact form`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
start();

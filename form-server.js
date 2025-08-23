const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'submissions.json');

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

// Handle requests
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle GET /status
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
        return;
    }

    // Handle POST /submit
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const formData = JSON.parse(body);
                
                // Validate required fields
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
                submissions.push({
                    id: Date.now(),
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.replace(/\s+/g, ''),
                    address: formData.address?.trim() || '',
                    city: formData.city?.trim() || '',
                    privacyAccepted: true,
                    submittedAt: new Date().toISOString(),
                    status: 'new'
                });
                
                // Save to file
                await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2));
                
                // Send success response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: '¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.'
                }));
                
            } catch (error) {
                console.error('Error processing submission:', error);
                sendError(res, 500, 'server', 'Error al procesar la solicitud');
            }
        });
        
        return;
    }

    // Handle 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

// Helper function to send error responses
function sendError(res, status, field, message) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        field,
        message
    }));
}

// Start server
async function start() {
    try {
        await ensureDataFile();
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log('Endpoints:');
            console.log('  GET  /status   - Check server status');
            console.log('  POST /submit   - Submit contact form');
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});

// Start the server
start();

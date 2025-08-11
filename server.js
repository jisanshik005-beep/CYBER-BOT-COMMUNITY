const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
    let filePath = '';
    
    // Route handling
    if (req.url === '/' || req.url === '/dashboard') {
        filePath = path.join(__dirname, 'dashboard.html');
    } else if (req.url === '/index') {
        filePath = path.join(__dirname, 'index.html');
    } else {
        // Handle static files (CSS, JS, images)
        filePath = path.join(__dirname, req.url);
    }
    
    // Get the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // MIME types for common file extensions
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Page not found
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Dashboard available at http://localhost:${PORT}/`);
});
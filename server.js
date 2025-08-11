const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Use environment variable for port or default to 8080
const PORT = process.env.PORT || 8080;

// Basic authentication for GitHub deployment
const GITHUB_USERNAME = process.env.AUTH_USERNAME || 'admin';
const GITHUB_PASSWORD = process.env.AUTH_PASSWORD || 'cyberbot';

// Function to check basic authentication
function checkAuth(req) {
    // Skip auth check for local development
    if (!process.env.GITHUB_ACTIONS) return true;
    
    const auth = req.headers.authorization;
    if (!auth) return false;
    
    // Basic authentication format: "Basic base64(username:password)"
    const [, base64Credentials] = auth.split(' ');
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    return username === GITHUB_USERNAME && password === GITHUB_PASSWORD;
}

const server = http.createServer((req, res) => {
    // Check authentication when deployed on GitHub
    if (process.env.GITHUB_ACTIONS && !checkAuth(req)) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic' });
        res.end('Authentication required');
        return;
    }
    
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
    
    // If we're in a GitHub Actions environment, set up localtunnel
    if (process.env.GITHUB_ACTIONS) {
        const localtunnel = require('localtunnel');
        (async () => {
            const tunnel = await localtunnel({ port: PORT, subdomain: process.env.LT_SUBDOMAIN });
            console.log(`Dashboard publicly available at: ${tunnel.url}`);
            
            tunnel.on('close', () => {
                console.log('Tunnel closed');
            });
        })();
    }
});
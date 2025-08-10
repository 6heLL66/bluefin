const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

console.log('Generating self-signed SSL certificate...');

try {
  execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${path.join(sslDir, 'key.pem')} -out ${path.join(sslDir, 'cert.pem')} -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('SSL certificate generated successfully!');
  console.log(`Certificate: ${path.join(sslDir, 'cert.pem')}`);
  console.log(`Private key: ${path.join(sslDir, 'key.pem')}`);
  console.log('\nNote: This is a self-signed certificate for development only.');
  console.log('For production, use proper SSL certificates from a certificate authority.');
} catch (error) {
  console.error('Error generating SSL certificate:', error.message);
  console.log('\nAlternative: You can manually create SSL certificates using:');
  console.log('openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"');
} 
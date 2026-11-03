import crypto from 'crypto';

console.log('====================================================');
console.log('🔐 JobPilot AI - Production Cryptographic Secret Generator');
console.log('====================================================\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated JWT_SECRET (Copy to your production environment):');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('Generated SESSION_SECRET:');
console.log(`SESSION_SECRET=${sessionSecret}\n`);

console.log('Instructions:');
console.log('1. Set JWT_SECRET in your Render, Railway, or VPS environment.');
console.log('2. Ensure MONGODB_URI points to your live MongoDB Atlas M0 cluster.');
console.log('3. Set CLIENT_URL to your Cloudflare Pages domain (e.g. https://your-app.pages.dev).');
console.log('====================================================');

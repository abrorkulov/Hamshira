// Main entry point. The complete API server and PostgreSQL setup live in one file.
const { start } = require('../server');

start().catch((error) => {
    console.error('Server start failed:', error);
    process.exit(1);
});



const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Library Management System Backend is running  `);
  console.log(`  Local URL: http://localhost:${PORT}           `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
});

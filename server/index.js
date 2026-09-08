const express = require('express');
const cors = require('cors');
const path = require('path');

const projectRoutes = require('./routes/projects');
const connectionRoutes = require('./routes/connections');
const pathRoutes = require('./routes/paths');
const taskRoutes = require('./routes/tasks');
const credentialRoutes = require('./routes/credentials');
const globalCredentialRoutes = require('./routes/globalCredentials');
const imageConverterRoutes = require('./routes/imageConverter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/global-credentials', globalCredentialRoutes);
app.use('/api/image-converter', imageConverterRoutes);

// Serve Frontend fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});

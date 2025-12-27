require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const aiRoutes = require('./src/routes/aiRoutes');
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.get('/health', (req, res) => {
  res.json({ status: "ok", message: "Backend AIdoList (Node.js) is running!" });
});

app.use((req, res, next) => {
  res.status(404).json({ msg: "Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
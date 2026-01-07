const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
const connectDB = require('./db/db');

connectDB();

const server = http.createServer(app);

server.listen(port,()=>{
    console.log(`server is running on ${port}`);
})

// Express.js setup

const http = require('http'); // Import the HTTP module
const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://task-bro-2e6d9.web.app'],
        methods: ['GET', 'POST', 'PATCH'],
    },
    transports: ['websocket', 'polling'], // Allow fallback
    allowEIO3: true, // Support older clients
});


 // Create an HTTP server



const port = process.env.PORT || 5050

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://task-bro-2e6d9.web.app'],
    credentials: true,
    optionSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

//efficiopro
//EYfLZdL7YltGyof3

// // MongoDB connection
const uri = `mongodb+srv://${process.env.EFFICIENTO_USER}:${process.env.EFFICIENTO_PASS}@cluster0.7szto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Socket.IO connection
io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        //   console.log('User disconnected:', socket.id);
    });
});

app.get('/', async (req, res) => {
    res.send('this is really running')
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const usersCollection = client.db('taskmanagement').collection('users');
        const tasksCollection = client.db('taskmanagement').collection('tasks');


        // POST /tasks - Add a new task
        app.post('/tasks', async (req, res) => {
            const { title, description, status } = req.body;
            const newTask = { title, description, status, timestamp: new Date() };
            try {
                const result = await tasksCollection.insertOne(newTask);

            } catch (error) {
                res.status(400).json({ message: 'Error creating task', error });
            }
            finally {
                res.send(newTask);
            }
        });

        // GET /tasks - Retrieve all tasks
        app.get('/tasks', async (req, res) => {
            try {
                const tasks = await tasksCollection.find().toArray();
                res.status(200).json(tasks);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching tasks', error });
            }
        });

        // PUT /tasks/:id - Update task details
        app.patch('/tasks/:id', async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;

            const result = await tasksCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status } },
                { returnDocument: 'after' }
            );

            if (result) {
                io.emit('taskUpdated', result); // Emit real-time update to all clients
                res.json(result);
            } else {
                res.status(404).json({ message: 'Task not found' });
            }
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);
// API Endpoints






// // DELETE /tasks/:id - Delete a task
// app.delete('/tasks/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
//         if (result.deletedCount === 0) return res.status(404).json({ message: 'Task not found' });
//         res.status(200).json({ message: 'Task deleted' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting task', error });
//     }
// });

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


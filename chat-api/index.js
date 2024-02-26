const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Chat = require('./models/Chat');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));
app.use(cookieParser());

const getUserDataFromRequest = async (req) => {
    return new Promise((resolve, reject) => {
        const {token} = req.cookies;
        if(token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if(err) throw err;
                resolve(userData);
            });
        } else reject('no token');
    });
}

app.get('/messages/:chatId', async (req, res) => {
    const {chatId} = req.params;
    const messages = await Message.find({ chatId }).sort({createdAt: 1});
    res.json(messages);
});

app.get('/users', async (req, res) => {
    const userData = await getUserDataFromRequest(req);
    const keyword = req.query.search ? { 
        $or: [ 
            { username: { $regex: req.query.search, $options: "i" } } 
        ], 
    } : {};
    const users = await User.find(keyword).find({ '_id': { $ne: userData.userId } });
    res.send(users);
});

app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    if(token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if(err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json('Unauthorized');
    }
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({userId:foundUser._id, username}, jwtSecret, {}, (err, token) => {
                res.cookie('token', token, {sameSite:'none', secure:true}).json({
                    id: foundUser._id,
                });
            });
        }
    }
});

app.post('/register', async (req, res) => {
    const {username, password, retypePassword} = req.body;
    if(password !== retypePassword) {
        res.status(400).json('Passwords do not match');
    }
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({username, password: hashedPassword});
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if(err) throw err;
            res.cookie('token', token, { sameSite:'none', secure: true }).status(201).json({
                id: createdUser._id,
                username
            });
        });
    } catch(err) {
        if(err) throw err;
        res.status(500).json('error');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token', { sameSite: 'none', secure: true }).json('ok');
});

app.post('/chat', async (req, res) => {
    const { id, username } = req.body;
    const userData = await getUserDataFromRequest(req);
    if(userData) {
        const createChat = await Chat.create({ 
            users: [
                { _id: id, username },
                { _id: userData.userId, username: userData.username }
            ],
            latestMessage: null
        });
        res.json(createChat);
    }
});

app.get('/chats', async (req, res) => {
    const {userId} = await getUserDataFromRequest(req);
    const chats = await Chat.find({
        users: { $elemMatch: { _id: userId } }
    });
    res.json(chats);
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({server});

wss.on('connection', (connection, req) => {

    const notifyAboutOnlinePeople = () => {
        const users = new Map();
        [...wss.clients].forEach(client => {
            if(client.userId) users.set(client.userId, { userId: client.userId, username: client.username });
        });

        const usersArray = Array.from(users);
        
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: usersArray
            }));
        });
    }
    
    connection.isAlive = true;
    
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            const username = connection.username || null;
            console.log('dead', username);
        }, 1000);
    }, 5000);
    
    connection.on('pong', (e) => {
        clearTimeout(connection.deathTimer);
    });

    connection.on('close', notifyAboutOnlinePeople);

    const cookies = req.headers.cookie;
    if(cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if(tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if(token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if(err) throw err;
                    const {username, userId} = userData;
                    connection.username = username;
                    connection.userId = userId;
                });
            }
        }
    }

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const {chatId, content} = messageData;

        const chat = (await Chat.find({ _id: chatId}))[0];
        const recipientId = chat.users.find(user => user._id.valueOf() !== connection.userId)._id.valueOf();

        if(chatId && content) {
            const messageDoc = await Message.create({
                senderId: connection.userId,
                chatId,
                content
            });
            [...wss.clients]
            .filter(c => c.userId === recipientId)
            .forEach(c => c.send(JSON.stringify({
                content, 
                senderId: connection.userId,
                chatId,
                _id: messageDoc._id
            })));
        }
    });

    notifyAboutOnlinePeople();
});
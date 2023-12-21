const express = require('express');
const userController = require('./controllers/userController');
const roomController = require('./controllers/roomController');
const voteController = require('./controllers/voteController');

const app = express();
app.use(express.json())

app.post('/api/user/register', userController.register);

app.post('/api/user/login', userController.login);

app.post('/api/rooms', roomController.create);

app.get('/api/rooms', roomController.list);

app.get('/api/rooms/:roomId');

app.put('/api/rooms/:roomId');

app.delete('/api/rooms/:roomId');

app.get('/api/rooms', roomController.list);

app.post('/api/vote', voteController.vote);

app.get('/api/statistic');

app.get('/api/statistic/:roomId');

app.post('/api/rooms/:roomId/invite');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
});
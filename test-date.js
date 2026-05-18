const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://erco:erco@macagel.wps8r.mongodb.net/MacAGel?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected'))
        .catch(err => console.error(err));
const Match = require('./backend/app_macagel/models/Match');
async function run() {
    const m = await Match.find().sort({createdAt:-1}).limit(1);
    console.log(m[0].date);
    process.exit(0);
}
run();

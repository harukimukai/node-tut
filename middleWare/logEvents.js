const { format } = require('date-fns');
const { v4: uuid } = require('uuid'); //const uuid でも別に良いけど、使用する時に
                                      //uuid.v4() と書かないといけなくなるから
                                      //こっちの方が良い v4 == version 4

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`; // \t == tab
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`; // \n == 改行
    console.log(logItem);

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs')); // このファイルをmiddleWareディレクトリに移動
                                                                        // させたから、'..'を(__dirname, 'logs')に
                                                                        // 追加してパスを変更した
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (err) {
        console.error(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
}


module.exports = {logEvents, logger};
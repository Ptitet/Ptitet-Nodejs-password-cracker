const { createHash } = require('crypto');
const { Worker } = require('worker_threads');

const dico = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

/**
 * 
 * @param {String} input 
 * @param {String} algo 
 * @returns String
 */

function hash(input, algo) {
    return createHash(algo).update(input).digest('hex');
}

/**
 * 
 * @param {String} input 
 * @returns String
 */

function next(input) {
    input = input.slice(0, input.length  - 4);
    let last = input[input.length - 1];
    if (last === '9') {
        let arr = input.split('');
        for (i in arr) {
            if (arr[arr.length - i - 1] === '9') {
                arr.splice(arr.length - i - 1, 1, 'a');
                if (!arr[arr.length - i - 2]) arr.unshift('a');
                else if (!(arr[arr.length - i - 2] === '9')) {
                    arr.splice(arr.length - i - 2, 1, dico[dico.indexOf(arr[arr.length - i - 2]) + 1]);
                    break;
                }
            }
        }
        return `${arr.join('')}aaaa`;
    } else return `${input.slice(0, -1)}${dico[dico.indexOf(last) + 1]}aaaa`;
}

/**
 * 
 * @param {String} input 
 * @param {String} algo 
 * @param {Number} nbOfWorkers 
 */

function crack(input, algo, nbOfWorkers) {
    const start = Date.now();

    console.log(`Starting cracking ${input} (using ${algo})\nSpawning ${nbOfWorkers} workers...\n`);

    let from = 'a';
    let to = 'aaaaa';
    const workers = [];

    for (let i = 0; i < nbOfWorkers; i++) {
        const worker = new Worker('./worker.js');
        workers.push(worker);
        worker.on('message', message => {
            if (message.password) {
                const time = Date.now() - start;
                console.log(`\nWorker [${i}] found the password !\nPassword : ${message.password}\nTime taken : ${time} ms`);
                workers.map(w => w.terminate());
                return process.exit(0);
            } else if (message.request) {
                worker.postMessage({from : from, to: to, input: input, algo: algo});
                console.log(`Restarting Worker [${i}] with interval ${from} - ${to}`);
                from = to;
                to = next(to);
            }
        });
        worker.on('error', error => {
            console.error(`Error Worker [${i}] : ${error.name}\n${error.message}`);
        });
        worker.on('exit', code => {
            if (code !== 0) console.log(`Worker [${i}] has stopped with code ${code}`);
        });
        worker.postMessage({from: from, to: to, input: input, algo: algo});
        console.log(`Starting Worker [${i}] with interval ${from} - ${to}`);
        from = to;
        to = next(to);
    }
    console.log(`\nAll the worker are processing ${input} (using ${algo})\n`);
}

crack('73b43f17232b391b9123adf40c1b65dd', 'md5', 10);

//ab = 187ef4436122d1cc2f40dc2b92f0eba0
//hell0 = 73b43f17232b391b9123adf40c1b65dd
//L0Zs = b01279944c7300116289e08b61be2149
//b9Z7 = 3fa0566ee34328a372276f8676cb7570
//aQ9 = aa771b7ed9bd1500fa8e24de7b05114a
import { checkAccountExists, parseAccountId, parseAmount } from './common.js';

export default async function transfer(db, args) {
    if (args.length !== 5 || args[1] !== 'from' || args[3] !== 'to') {
        console.log('Usage: t[ransfer] <amount> from <sender> to <receiver>')
        return;
    }
    const amount = parseAmount(args[0]);
    const sender = parseAccountId(args[2]);
    const receiver = parseAccountId(args[4]);
    await doTransfer(db, amount, sender, receiver);
}

async function doTransfer(db, amount, sender, receiver) {
    // Start SQL Transaction
    await db.query('begin; set transaction isolation level repeatable read')
    try{
        // Check sender exists-
        await checkAccountExists(db, sender);
        // Check reciever exists-
        await checkAccountExists(db, receiver);
        // Update senders balance
        await db.query('update accounts set balance = balance - $1 where account_id = $2', [amount, sender]);
        // Update recievers balance
        await db.query('update accounts set balance = balance + $1 where account_id = $2', [amount, receiver]);
        // Save transaction
        await db.query('commit')
    }
    catch(e) {
        // Roll the transaction back if we encounter an errors
        await db.query('rollback')
        // Inform the user why the transaction couldnt be saved
        console.log('WARN - 1 or more rules were violated. Transfer rolled back.')
    }
}

import { checkAccountExists, parseAmount, parseAccountId } from './common.js';

export default async function withdraw(db, args) {
    if (args.length !== 3 || args[1] !== 'from') {
        console.log('Usage: w[ithdraw] <amount> from <account>');
        return;
    }
    const amount = parseAmount(args[0]);
    const account = parseAccountId(args[2]);
    await doWithdraw(db, amount, account);
}

async function doWithdraw(db, amount, account) {
    // Perform check that the account exists
    await checkAccountExists(db, account);
    // Try and remove the amount of money from the account (Cannot remove too much as this would violate our non-negative integer constraint on the accounts)
    await db.query('update accounts set balance = balance - $1 where account_id = $2', [amount, account]);
    // Consolidate the vault
    await db.query('update vault set balance = balance - $1', [amount]);
}

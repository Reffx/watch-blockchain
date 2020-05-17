'use strict';

const { Contract } = require('fabric-contract-api');
const allManufacturersKey = 'all-manufacturers';
const earnPointsTransactionsKey = 'earn-points-transactions';
const usePointsTransactionsKey = 'use-points-transactions';
const allWatchesTransactionKey = 'all-watches-transactions';

class AntiCounterfeiting extends Contract {


    // Init function executed when the ledger is instantiated
    async instantiate(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify([])));

        console.info('============= END : Initialize Ledger ===========');
    }

    // Add a member on the ledger
    async CreateMember(ctx, member) {
        member = JSON.parse(member);

        await ctx.stub.putState(member.accountNumber, Buffer.from(JSON.stringify(member)));

        return JSON.stringify(member);
    }

    // Add a manufacturer on the ledger, and add it to the all-manufacturers list
    async CreateManufacturer(ctx, manufacturer) {
        manufacturer = JSON.parse(manufacturer);

        await ctx.stub.putState(manufacturer.name, Buffer.from(JSON.stringify(manufacturer)));

        let allManufacturers = await ctx.stub.getState(allManufacturersKey);
        allManufacturers = JSON.parse(allManufacturers);
        allManufacturers.push(manufacturer);
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify(allManufacturers)));

        return JSON.stringify(manufacturer);
    }

    // Record a transaction where a member earns points
    async EarnPoints(ctx, earnPoints) {
        earnPoints = JSON.parse(earnPoints);
        earnPoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
        earnPoints.transactionId = ctx.stub.txId;

        let member = await ctx.stub.getState(earnPoints.member);
        member = JSON.parse(member);
        member.points += earnPoints.points;
        await ctx.stub.putState(earnPoints.member, Buffer.from(JSON.stringify(member)));

        let earnPointsTransactions = await ctx.stub.getState(earnPointsTransactionsKey);
        earnPointsTransactions = JSON.parse(earnPointsTransactions);
        earnPointsTransactions.push(earnPoints);
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify(earnPointsTransactions)));

        return JSON.stringify(earnPoints);
    }

    // Record a transaction where a member redeems points
    async UsePoints(ctx, usePoints) {
        usePoints = JSON.parse(usePoints);
        usePoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
        usePoints.transactionId = ctx.stub.txId;

        let member = await ctx.stub.getState(usePoints.member);
        member = JSON.parse(member);
        if (member.points < usePoints.points) {
            throw new Error('Member does not have sufficient points');
        }
        member.points -= usePoints.points;
        await ctx.stub.putState(usePoints.member, Buffer.from(JSON.stringify(member)));

        let usePointsTransactions = await ctx.stub.getState(usePointsTransactionsKey);
        usePointsTransactions = JSON.parse(usePointsTransactions);
        usePointsTransactions.push(usePoints);
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify(usePointsTransactions)));

        return JSON.stringify(usePoints);
    }

    // Get earn points transactions of the particular member or manufacturer
    async EarnPointsTransactionsInfo(ctx, userType, userId) {
        console.info('============= START : EarnPointsTransactionsInfo ===========');

        let transactions = await ctx.stub.getState(earnPointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'member') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'manufacturer') {
                if (transaction.manufacturer === userId) {
                    userTransactions.push(transaction);
                }
            }
        }

        console.info('============= END : EarnPointsTransactionsInfo ===========');
        return JSON.stringify(userTransactions);
    }

    // Get use points transactions of the particular member or manufacturer
    async UsePointsTransactionsInfo(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(usePointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'member') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'manufacturer') {
                if (transaction.manufacturer === userId) {
                    userTransactions.push(transaction);
                }
            }
        }

        return JSON.stringify(userTransactions);
    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);

        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

    async CreateWatch(ctx, watchInformation) {
        console.info('============= START : Create Watch ===========');
        watchInformation = JSON.parse(watchInformation);

        //let usePointsTransactions = await ctx.stub.getState(showWatchesTransactionKey);
        watchInformation.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
        watchInformation.transactionId = ctx.stub.txId;
        watchInformation.transactionType = "newWatchOwner";

        //push to Watchspecific chain

        let createWatchTransaction = [];
        createWatchTransaction.push(watchInformation);
        await ctx.stub.putState(watchInformation.manufacturer + "-" + watchInformation.watchId, Buffer.from(JSON.stringify(createWatchTransaction)));

        //push to allWatchTransactions
        let allWatchTransactions = await ctx.stub.getState(allWatchesTransactionKey);
        allWatchTransactions = JSON.parse(allWatchTransactions);
        allWatchTransactions.push(watchInformation);
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify(allWatchTransactions))); //push to all watches

        console.info('============= END : Create Watch ===========');
        return JSON.stringify(watchInformation);
    }

    async ChangeWatchOwner(ctx, watchId, manufacturerName, oldOwner, newOwner) {
        console.info('============= START : changeWatchOwner ===========');
        //get chain for all Watches key
        let allWatchesTransaction = await ctx.stub.getState(allWatchesTransactionKey);
        allWatchesTransaction = JSON.parse(allWatchesTransaction);

        // get chain for specific watch
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        transactions = JSON.parse(transactions);
        
        //logic
        let allRecentWatchesTransactions = [];

        for (let transaction of transactions) {
            if (transaction.transactionType === "newWatchOwner") {
                allRecentWatchesTransactions.push(transaction);
            }
        }

        let oldTransaction = [];
            if (allRecentWatchesTransactions[allRecentWatchesTransactions.length-1].owner === oldOwner){
                oldTransaction.push(allRecentWatchesTransactions[allRecentWatchesTransactions.length-1]);
        } else JSON.stringify(0);

        let newTransaction = {};
        if (oldTransaction[0].owner === oldOwner) {
            newTransaction.watchId = oldTransaction[0].watchId;
            newTransaction.manufacturer = oldTransaction[0].manufacturer;
            newTransaction.model = oldTransaction[0].model;
            newTransaction.color = oldTransaction[0].color;
            newTransaction.owner = newOwner;
            newTransaction.transactionType = "newWatchOwner";
            newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
            newTransaction.transactionId = ctx.stub.txId;
            //push new Transaction to chain
            transactions.push(newTransaction);
            allWatchesTransaction.push(newTransaction);
        }

        //submit new chain
        await ctx.stub.putState(manufacturerName + "-" + watchId, Buffer.from(JSON.stringify(transactions)));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify(allWatchesTransaction)));
        console.info('============= END : changeWatchOwner ===========');
        return JSON.stringify(newTransaction);
    }

    async QuerySingleWatch(ctx, manufacturerName, watchId) {
        console.info('============= START : Query Single Watch ===========');
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        let userTransactions = [];
        if (transactions.length !== 0) {
            transactions = JSON.parse(transactions);

            for (let transaction of transactions) {
                userTransactions.push(transaction);
            }
        }
        console.info('============= END : Query Single Watch ===========');
        if (userTransactions.length === 0) {
            return JSON.stringify(0);
        } else {
            return JSON.stringify(userTransactions);
        }
    }

    async CheckWatchExistence(ctx, manufacturerName, watchId) {
        console.info('============= START : CheckExistence Single Watch ===========');
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        if (transactions.length === 0) {
            console.info('============= END : CheckExistence Single Watch ===========');
            return JSON.stringify(0);
        }
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (transaction.manufacturer === manufacturerName) {
                userTransactions.push(transaction);
            }
        }

        if (userTransactions.length === 0) {
            console.info('============= END : CheckExistence Single Watch ===========');
            return JSON.stringify(0);
        } else {
            console.info('============= END : CheckExistence Single Watch ===========');
            return JSON.stringify(1);
        }

    }

    async QueryMyWatches(ctx, currentOwner) {
        console.info('============= START : Query Single Watch ===========');
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let allRecentWatchesTransactions = [];
        
        for (let transaction of transactions) {
            if (transaction.owner === currentOwner && !contains(transaction)) {
                let watchChain = await ctx.stub.getState(transaction.manufacturer + "-" + transaction.watchId );
                watchChain = JSON.parse(watchChain);
                for(let i = watchChain.length; i > 0; i--){
                    if (watchChain[i-1].transactionType === "newWatchOwner") {
                        if(watchChain[i-1].owner === currentOwner){
                            allRecentWatchesTransactions.push(watchChain[i-1]);
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        function contains(trx){
            for (let text of allRecentWatchesTransactions){
                if (trx.owner === text) {
                    return true;
                }
            }
            return false;
        }
        
        console.info('============= END : Query Single Watch ===========');
        return JSON.stringify(allRecentWatchesTransactions);
    }

    async QueryAllWatches(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            userTransactions.push(transaction);
        }

        // for (let transaction of transactions) {
        //     if (userType === 'member') {
        //         if (transaction.member === userId) {
        //             userTransactions.push(transaction);
        //         }
        //     } else if (userType === 'manufacturer') {
        //         if (transaction.manufacturer === userId) {
        //             userTransactions.push(transaction);
        //         }
        //     }
        // }

        return JSON.stringify(userTransactions);

    }

    async CountAllManufacturers(ctx) {
        let transactions = await ctx.stub.getState(allManufacturersKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            userTransactions.push(transaction);
        }
        let countManufacturers = userTransactions.length;

        // eslint-disable-next-line no-constant-condition
        // countManufacturers = keyManu.length;
        // console.log('end of data');
        // console.info(countManufacturers);
        return JSON.stringify(countManufacturers);

    }


}

module.exports = AntiCounterfeiting;
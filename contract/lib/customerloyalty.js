'use strict';

const { Contract } = require('fabric-contract-api');
const allPartnersKey = 'all-partners';
const earnPointsTransactionsKey = 'earn-points-transactions';
const usePointsTransactionsKey = 'use-points-transactions';

class CustomerLoyalty extends Contract {

    // Init function executed when the ledger is instantiated
    async instantiate(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify([])));

        console.info('============= END : Initialize Ledger ===========');
    }

    // Add a member on the ledger
    async CreateMember(ctx, member) {
        member = JSON.parse(member);

        await ctx.stub.putState(member.accountNumber, Buffer.from(JSON.stringify(member)));

        return JSON.stringify(member);
    }

    // Add a partner on the ledger, and add it to the all-partners list
    async CreatePartner(ctx, partner) {
        partner = JSON.parse(partner);

        await ctx.stub.putState(partner.id, Buffer.from(JSON.stringify(partner)));

        let allPartners = await ctx.stub.getState(allPartnersKey);
        allPartners = JSON.parse(allPartners);
        allPartners.push(partner);
        await ctx.stub.putState(allPartnersKey, Buffer.from(JSON.stringify(allPartners)));

        return JSON.stringify(partner);
    }

    // Record a transaction where a member earns points
    async EarnPoints(ctx, earnPoints) {
        earnPoints = JSON.parse(earnPoints);
        earnPoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low*1000)).toGMTString();
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
        usePoints.timestamp = new Date((ctx.stub.txTimestamp.seconds.low*1000)).toGMTString();
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

    // Get earn points transactions of the particular member or partner
    async EarnPointsTransactionsInfo(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(earnPointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'member') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'partner') {
                if (transaction.partner === userId) {
                    userTransactions.push(transaction);
                }
            }
        }

        return JSON.stringify(userTransactions);
    }

    // Get use points transactions of the particular member or partner
    async UsePointsTransactionsInfo(ctx, userType, userId) {
        let transactions = await ctx.stub.getState(usePointsTransactionsKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];

        for (let transaction of transactions) {
            if (userType === 'member') {
                if (transaction.member === userId) {
                    userTransactions.push(transaction);
                }
            } else if (userType === 'partner') {
                if (transaction.partner === userId) {
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

    async createWatch(ctx, watchId, model, color, owner) {
        console.info('============= START : Create Watch ===========');

        const watch = {
            color,
            docType: 'watch',
            model,
            owner,
        };

        await ctx.stub.putState(watchId, Buffer.from(JSON.stringify(watch)));
        console.info('============= END : Create Watch ===========');
    }

    async changeWatchOwner(ctx, watchId, newOwner) {
        console.info('============= START : changeWatchOwner ===========');

        const watchAsBytes = await ctx.stub.getState(watchId); // get the watch from chaincode state
        if (!watchAsBytes || watchAsBytes.length === 0) {
            throw new Error(`${watchId} does not exist`);
        }
        const watch = JSON.parse(watchAsBytes.toString());
        watch.owner = newOwner;

        await ctx.stub.putState(watchId, Buffer.from(JSON.stringify(watch)));
        console.info('============= END : changeWatchOwner ===========');
    }

    async queryAllWatches(ctx) {
        const startKey = 'WATCH0';
        const endKey = 'WATCH999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }


}

module.exports = CustomerLoyalty;
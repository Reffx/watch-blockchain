'use strict';

const { Contract } = require('fabric-contract-api');
const allManufacturersKey = 'all-manufacturers';
const allRetailersKey = 'all-retailers';
const earnPointsTransactionsKey = 'earn-points-transactions';
const usePointsTransactionsKey = 'use-points-transactions';
const allWatchesTransactionKey = 'all-watches-transactions';

class AntiCounterfeiting extends Contract {

    // Init function executed when the ledger is instantiated
    async instantiate(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allRetailersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(earnPointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(usePointsTransactionsKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify([])));

        console.info('============= END : Initialize Ledger ===========');
    }

    // Add a member on the ledger
    async CreateMember(ctx, member) {
        member = JSON.parse(member);
        //test
        let memberInformation = [];
        memberInformation.push(member);

        await ctx.stub.putState(member.accountNumber, Buffer.from(JSON.stringify(memberInformation)));

        return JSON.stringify(member);
    }

    // Add a manufacturer on the ledger, and add it to the all-manufacturers list
    async CreateManufacturer(ctx, manufacturer) {
        manufacturer = JSON.parse(manufacturer);
        //test
        let manufacturerInformation = [];
        manufacturerInformation.push(manufacturer);

        await ctx.stub.putState(manufacturer.name, Buffer.from(JSON.stringify(manufacturerInformation)));

        let allManufacturers = await ctx.stub.getState(allManufacturersKey);
        allManufacturers = JSON.parse(allManufacturers);
        allManufacturers.push(manufacturer);
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify(allManufacturers)));

        return JSON.stringify(manufacturer);
    }

    // Add a retailer on the ledger, and add it to the all-manufacturers list
    async CreateRetailer(ctx, retailer) {
        retailer = JSON.parse(retailer);
        //test
        let retailerInformation = [];
        retailerInformation.push(retailer);

        await ctx.stub.putState(retailer.name, Buffer.from(JSON.stringify(retailerInformation)));

        let allRetailers = await ctx.stub.getState(allRetailersKey);
        allRetailers = JSON.parse(allRetailers);
        allRetailers.push(retailer);
        await ctx.stub.putState(allRetailersKey, Buffer.from(JSON.stringify(allRetailers)));

        return JSON.stringify(retailer);
    }

    // Get latest information about Manufacturer
    async GetLatestManufacturerInfo(ctx, manufacturerName) {
        let transactions = await ctx.stub.getState(manufacturerName);
        transactions = JSON.parse(transactions);

        let manuInformation = [];
        for (let c of transactions) {
            manuInformation.push(c);
        }

        manuInformation = manuInformation[manuInformation.length - 1];

        return JSON.stringify(transactions);
    }

    // Get latest information about retailer
    async GetLatestRetailerInfo(ctx, retailerName) {
        let transactions = await ctx.stub.getState(retailerName);
        transactions = JSON.parse(transactions);

        let retaInformation = [];
        for (let c of transactions) {
            retaInformation.push(c);
        }

        retaInformation = retaInformation[retaInformation.length - 1];

        return JSON.stringify(transactions);
    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);

        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

    async GetVerifyRetailersByManufacturer(ctx, manufacturerName) {
        let transactions = await ctx.stub.getState(manufacturerName + "-verifiedRetailers");
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            let verifiedTransactions = [];
            for (let transaction of transactions) {
                verifiedTransactions.push(transaction);
            }
            let lastVerifiedTransaction = verifiedTransactions[verifiedTransactions.length - 1];
            return JSON.stringify(lastVerifiedTransaction);
        }
    }

    async GetVerifyRetailersByRetailer(ctx, retailerName) {
        let transactions = await ctx.stub.getState(retailerName + "-verifiedByManufacturers");
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            let verifiedTransactions = [];
            for (let transaction of transactions) {
                verifiedTransactions.push(transaction);
            }
            let lastVerifiedTransaction = verifiedTransactions[verifiedTransactions.length - 1];
            return JSON.stringify(lastVerifiedTransaction);
        }
    }

    async AddVerifiedRetailer(ctx, manufacturerName, retailerName) {
        //byManufacturer
        let transactions = await ctx.stub.getState(manufacturerName + "-verifiedRetailers");
        let verifiedRetailersTransactions = [];
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            for (let transaction of transactions) {
                verifiedRetailersTransactions.push(transaction);
            }
            let currentRetailerList = [...verifiedRetailersTransactions[verifiedRetailersTransactions.length - 1].retailerList];
            let index = currentRetailerList.indexOf(retailerName);
            if (index === -1) {
                currentRetailerList.push(retailerName);

                let newTransaction = {};
                newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction.retailerList = currentRetailerList;

                transactions.push(newTransaction);
                await ctx.stub.putState(manufacturerName + "-verifiedRetailers", Buffer.from(JSON.stringify(transactions))); //push 
            }
        } else {
            let newTransaction = {};
            newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
            newTransaction.retailerList = [];
            newTransaction.retailerList.push(retailerName);
            verifiedRetailersTransactions.push(newTransaction);
            await ctx.stub.putState(manufacturerName + "-verifiedRetailers", Buffer.from(JSON.stringify(verifiedRetailersTransactions)));
        }

        //byRetailer
        let transactions2 = await ctx.stub.getState(retailerName + "-verifiedByManufacturers");
        let verifiedRetailersTransactions2 = [];
        if (transactions2.length != 0) {
            transactions2 = JSON.parse(transactions2);
            for (let transaction of transactions2) {
                verifiedRetailersTransactions2.push(transaction);
            }
            let currentManufacturerList = [...verifiedRetailersTransactions2[verifiedRetailersTransactions2.length - 1].manufacturerList];
            let index = currentManufacturerList.indexOf(manufacturerName);
            if (index === -1) {
                currentManufacturerList.push(manufacturerName);

                let newTransaction2 = {};
                newTransaction2.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction2.manufacturerList = currentManufacturerList;

                transactions2.push(newTransaction2);
                await ctx.stub.putState(retailerName + "-verifiedByManufacturers", Buffer.from(JSON.stringify(transactions2))); //push 
            }
        } else {
            let newTransaction2 = {};
            newTransaction2.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
            newTransaction2.manufacturerList = [];
            newTransaction2.manufacturerList.push(manufacturerName);
            verifiedRetailersTransactions2.push(newTransaction2);
            await ctx.stub.putState(retailerName + "-verifiedByManufacturers", Buffer.from(JSON.stringify(verifiedRetailersTransactions2)));
        }
    }

    async RemoveVerifiedRetailer(ctx, manufacturerName, retailerName) {
        //Remove by manufacturer chain
        let transactions = await ctx.stub.getState(manufacturerName + "-verifiedRetailers");
        let verifiedRetailersTransactions = [];
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            for (let transaction of transactions) {
                verifiedRetailersTransactions.push(transaction);
            }
            //get last RetailerList and remove retailername
            let currentRetailerList = [...verifiedRetailersTransactions[verifiedRetailersTransactions.length - 1].retailerList];
            let index = currentRetailerList.indexOf(retailerName);
            if (index != -1) {
                currentRetailerList.splice(currentRetailerList.indexOf(retailerName), 1);

                let newTransaction = {};
                newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction.retailerList = currentRetailerList;

                //push new Transaction to the chain
                transactions.push(newTransaction);
                await ctx.stub.putState(manufacturerName + "-verifiedRetailers", Buffer.from(JSON.stringify(transactions)));
            }
        }
        //Remove by retailer chain
        let transactions2 = await ctx.stub.getState(retailerName + "-verifiedByManufacturers");
        let verifiedRetailersTransactions2 = [];
        if (transactions2.length != 0) {
            transactions2 = JSON.parse(transactions2);
            for (let transaction of transactions2) {
                verifiedRetailersTransactions2.push(transaction);
            }
            //get last RetailerList and remove retailername
            let currentManufacturerList = [...verifiedRetailersTransactions2[verifiedRetailersTransactions2.length - 1].manufacturerList];
            let index = currentManufacturerList.indexOf(manufacturerName);
            if (index != -1) {
                currentManufacturerList.splice(currentManufacturerList.indexOf(manufacturerName), 1);

                let newTransaction2 = {};
                newTransaction2.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction2.manufacturerList = currentManufacturerList;

                //push new Transaction to the chain
                transactions2.push(newTransaction2);
                await ctx.stub.putState(retailerName + "-verifiedByManufacturers", Buffer.from(JSON.stringify(transactions2)));
            }
        }

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
        if (allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1].owner === oldOwner) {
            oldTransaction.push(allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1]);
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

    async AddMaintenanceEvent(ctx, watchId, manufacturerName, maintenanceInfo) {
        console.info('============= START : addMaintenance ===========');
        //get chain for all Watches key
        let allWatchesTransaction = await ctx.stub.getState(allWatchesTransactionKey);
        allWatchesTransaction = JSON.parse(allWatchesTransaction);

        // get chain for specific watch
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        transactions = JSON.parse(transactions);

        //logic
        let allRecentWatchesTransactions = [];

        for (let transaction of transactions) {
            allRecentWatchesTransactions.push(transaction);
        }

        let oldTransaction = allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1];

        let newTransaction = {};
        newTransaction.watchId = oldTransaction.watchId;
        newTransaction.manufacturer = oldTransaction.manufacturer;
        newTransaction.model = oldTransaction.model;
        newTransaction.color = oldTransaction.color;
        newTransaction.owner = oldTransaction.owner;
        newTransaction.transactionType = "maintenanceEvent";
        newTransaction.info = maintenanceInfo;
        newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
        newTransaction.transactionId = ctx.stub.txId;
        //push new Transaction to chain
        transactions.push(newTransaction);
        allWatchesTransaction.push(newTransaction);

        //submit new chain
        await ctx.stub.putState(manufacturerName + "-" + watchId, Buffer.from(JSON.stringify(transactions)));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify(allWatchesTransaction)));
        console.info('============= END : addMaintenance ===========');
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

    async GetMyWatches(ctx, currentOwner) {
        console.info('============= START : Query Single Watch ===========');
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let allWatchesTransactions = [];

        for (let transaction of transactions) {
            transaction.uniqueId = transaction.manufacturer+transaction.watchId;
            allWatchesTransactions.push(transaction);
            }
        
        // filter regarding newest owner for each watch
        let uniqueNewWatchesId = [];
        let uniqueNewWatchesTransactions = [];
        for (let i = allWatchesTransactions.length; i > 0; i--){
            if (allWatchesTransactions[i-1].transactionType === "newWatchOwner" && (uniqueNewWatchesId.indexOf(allWatchesTransactions[i].uniqueId) === -1)){
                uniqueNewWatchesId.push(allWatchesTransactions[i].uniqueId);
                uniqueNewWatchesTransactions.push(allWatchesTransactions[i]);
            }
        }
    
        //filter regarding owner
        let result = [];
        for (let trans of uniqueNewWatchesTransactions){
            if (trans.owner === currentOwner){
                result.push(trans);
            }
        }

        return JSON.stringify(result);
    }

    async QueryAllWatches(ctx) {
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];
        for (let transaction of transactions) {
            userTransactions.push(transaction);
        }
        return JSON.stringify(userTransactions);

    }

    async CountAllManufacturers(ctx) {
        let transactions = await ctx.stub.getState(allManufacturersKey);
        if (transactions.length === 0) {
            return JSON.stringify(0)
        }
        else {
            transactions = JSON.parse(transactions);
            let userTransactions = [];
            for (let transaction of transactions) {
                userTransactions.push(transaction);
            }
            let countManufacturers = userTransactions.length;
            return JSON.stringify(countManufacturers);
        }
    }

    async CountAllRetailers(ctx) {
        let transactions = await ctx.stub.getState(allRetailersKey);
        if (transactions.length === 0) {
            return JSON.stringify(0)
        }
        else {
            transactions = JSON.parse(transactions);
            let userTransactions = [];
            for (let transaction of transactions) {
                userTransactions.push(transaction);
            }
            let countRetailers = userTransactions.length;
            return JSON.stringify(countRetailers);
        }
    }

}

module.exports = AntiCounterfeiting;
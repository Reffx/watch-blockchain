'use strict';

const { Contract } = require('fabric-contract-api');
const allManufacturersKey = 'all-manufacturers';
const allRetailersKey = 'all-retailers';
const allWatchesTransactionKey = 'all-watches-transactions';
const allStolenWatchesTransaction = 'all-stolen-watches-transactions';

class AntiCounterfeiting extends Contract {

    // Init function executed when the ledger is instantiated
    async instantiate(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        await ctx.stub.putState('instantiate', Buffer.from('INIT-LEDGER'));
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allRetailersKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify([])));
        await ctx.stub.putState(allStolenWatchesTransaction, Buffer.from(JSON.stringify([])));

        console.info('============= END : Initialize Ledger ===========');
    }

    // Add a member on the ledger
    async CreateMember(ctx, member) {
        member = JSON.parse(member);
        member.userType = "member";

        let memberInformation = [];
        memberInformation.push(member);

        await ctx.stub.putState(member.name, Buffer.from(JSON.stringify(memberInformation)));

        return JSON.stringify(member);
    }

    // Add a manufacturer on the ledger, and add it to the all-manufacturers list
    async CreateManufacturer(ctx, manufacturer) {
        manufacturer = JSON.parse(manufacturer);
        manufacturer.userType = "manufacturer";

        let manufacturerInformation = [];
        manufacturerInformation.push(manufacturer);

        await ctx.stub.putState(manufacturer.name, Buffer.from(JSON.stringify(manufacturerInformation)));

        let allManufacturers = await ctx.stub.getState(allManufacturersKey);
        allManufacturers = JSON.parse(allManufacturers);
        allManufacturers.push(manufacturer);
        await ctx.stub.putState(allManufacturersKey, Buffer.from(JSON.stringify(allManufacturers)));

        return JSON.stringify(manufacturer);
    }

    // Add a retailer on the ledger, and add it to the all-retailer list
    async CreateRetailer(ctx, retailer) {
        retailer = JSON.parse(retailer);
        retailer.userType = "retailer";

        let retailerInformation = [];
        retailerInformation.push(retailer);

        await ctx.stub.putState(retailer.name, Buffer.from(JSON.stringify(retailerInformation)));

        let allRetailers = await ctx.stub.getState(allRetailersKey);
        allRetailers = JSON.parse(allRetailers);
        allRetailers.push(retailer);
        await ctx.stub.putState(allRetailersKey, Buffer.from(JSON.stringify(allRetailers)));

        return JSON.stringify(retailer);
    }

    // Get latest information about manufacturer
    async GetLatestManufacturerInfo(ctx, manufacturerName) {
        let transactions = await ctx.stub.getState(manufacturerName);
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);

            let manuInformation = [];
            for (let c of transactions) {
                manuInformation.push(c);
            }

            manuInformation = manuInformation[manuInformation.length - 1];
            return JSON.stringify(manuInformation);
        } else return JSON.stringify(0);
    }

    // Get latest information about retailer
    async GetLatestRetailerInfo(ctx, retailerName) {
        let transactions = await ctx.stub.getState(retailerName);
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);

            let retaInformation = [];
            for (let c of transactions) {
                retaInformation.push(c);
            }

            retaInformation = retaInformation[retaInformation.length - 1];
            return JSON.stringify(retaInformation);
        } else return JSON.stringify(0);

    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);

        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

    //returns the verified retailers by manucaturer
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

    //returns the manufacturers by which the retailer is verified
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

    // adds a retailer to the verified list of a specific manufacturer
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

    // removes a retailer to the verified list of a specific manufacturer
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

    //create a new watch
    async CreateWatch(ctx, watchInformation) {
        console.info('============= START : Create Watch ===========');
        watchInformation = JSON.parse(watchInformation);

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

    //changes the WatchOwner
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
            newTransaction.info = "This watch changed its owner from " + oldOwner + " to " + newOwner + ".";
            newTransaction.watchId = oldTransaction[0].watchId;
            newTransaction.manufacturer = oldTransaction[0].manufacturer;
            newTransaction.attribut1 = oldTransaction[0].attribut1;
            newTransaction.attribut2 = oldTransaction[0].attribut2;
            newTransaction.attribut3 = oldTransaction[0].attribut3;
            newTransaction.attribut4 = oldTransaction[0].attribut4;
            newTransaction.attribut5 = oldTransaction[0].attribut5;
            newTransaction.transaction_executor = oldOwner;
            newTransaction.verified_information = "verified transaction!";
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

    //Shows that the owner of the watch is interested in selling the watch with 
    async ShowSellInterest(ctx, watchId, manufacturerName, owner, interestInformation) {
        console.info('============= START : showSellInterest ===========');
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
        if (allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1].owner === owner) {
            oldTransaction.push(allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1]);
        } else JSON.stringify(0);

        let newTransaction = {};
        if (oldTransaction[0].owner === owner) {
            newTransaction.info = "This watch has a sales interest: " + interestInformation + ".";
            newTransaction.watchId = oldTransaction[0].watchId;
            newTransaction.manufacturer = oldTransaction[0].manufacturer;
            newTransaction.attribut1 = oldTransaction[0].attribut1;
            newTransaction.attribut2 = oldTransaction[0].attribut2;
            newTransaction.attribut3 = oldTransaction[0].attribut3;
            newTransaction.attribut4 = oldTransaction[0].attribut4;
            newTransaction.attribut5 = oldTransaction[0].attribut5;
            newTransaction.transaction_executor = owner;
            newTransaction.verified_information = "verified transaction!";
            newTransaction.owner = owner;
            newTransaction.transactionType = "SalesInterest";
            newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
            newTransaction.transactionId = ctx.stub.txId;
            //push new Transaction to chain
            transactions.push(newTransaction);
            allWatchesTransaction.push(newTransaction);
        }

        //submit new chain
        await ctx.stub.putState(manufacturerName + "-" + watchId, Buffer.from(JSON.stringify(transactions)));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify(allWatchesTransaction)));
        console.info('============= END : showSellInterest ===========');
        return JSON.stringify(newTransaction);
    }

    //add maintenance event
    async AddMaintenanceEvent(ctx, executorName, watchId, manufacturerName, maintenanceInfo, autenticityChecked) {
        console.info('============= START : addMaintenance ===========');
        //get chain for all Watches key
        let allWatchesTransaction = await ctx.stub.getState(allWatchesTransactionKey);
        allWatchesTransaction = JSON.parse(allWatchesTransaction);

        // get chain for specific watch
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        transactions = JSON.parse(transactions);

        let verifiedInformation = 'No!';
        let verifiedRetailersTrans = await this.GetVerifyRetailersByManufacturer(ctx, manufacturerName);
        if (verifiedRetailersTrans.length != 0) {
            verifiedRetailersTrans = JSON.parse(verifiedRetailersTrans);
            if (verifiedRetailersTrans.retailerList.indexOf(executorName) != -1) {
                if (autenticityChecked === 'true') {
                    verifiedInformation = 'Yes! Authenticity checked!'
                } else {
                    verifiedInformation = 'Yes! However, authenticity NOT fully checked!'
                }
            }
        }

        //logic
        let allRecentWatchesTransactions = [];

        for (let transaction of transactions) {
            if (transaction.transactionType === "newWatchOwner") {
                allRecentWatchesTransactions.push(transaction);
            }
        }

        //get Information of last Transaction that watchowner was changed
        let oldTransaction = allRecentWatchesTransactions[allRecentWatchesTransactions.length - 1];

        let newTransaction = {};
        newTransaction.watchId = oldTransaction.watchId;
        newTransaction.manufacturer = oldTransaction.manufacturer;
        newTransaction.attribut1 = oldTransaction.attribut1;
        newTransaction.attribut2 = oldTransaction.attribut2;
        newTransaction.attribut3 = oldTransaction.attribut3;
        newTransaction.attribut4 = oldTransaction.attribut4;
        newTransaction.attribut5 = oldTransaction.attribut5;
        newTransaction.owner = oldTransaction.owner;
        newTransaction.transaction_executor = executorName;
        newTransaction.verified_information = verifiedInformation;
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

    //get a single watch
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

    //check existence of a watch
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

    //get watches of owner
    async GetMyWatches(ctx, currentOwner) {
        console.info('============= START : Query Single Watch ===========');
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let allWatchesTransactions = [];

        for (let transaction of transactions) {
            transaction.uniqueId = transaction.manufacturer + transaction.watchId;
            allWatchesTransactions.push(transaction);
        }

        // filter regarding newest owner for each watch
        let uniqueNewWatchesId = [];
        let uniqueNewWatchesTransactions = [];
        for (let i = allWatchesTransactions.length; i > 0; i--) {
            if (allWatchesTransactions[i - 1].transactionType === "newWatchOwner" && (uniqueNewWatchesId.indexOf(allWatchesTransactions[i - 1].uniqueId) === -1)) {
                uniqueNewWatchesId.push(allWatchesTransactions[i - 1].uniqueId);
                uniqueNewWatchesTransactions.push(allWatchesTransactions[i - 1]);
            }
        }

        //filter regarding owner
        let result = [];
        for (let trans of uniqueNewWatchesTransactions) {
            if (trans.owner === currentOwner) {
                result.push(trans);
            }
        }

        return JSON.stringify(result);
    }

    //get all transactions of watches
    async GetMyWatchesAllTransactions(ctx, currentOwner) {
        console.info('============= START : Query Single Watch ===========');
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let allWatchesTransactions = [];

        for (let transaction of transactions) {
            transaction.uniqueId = transaction.manufacturer + transaction.watchId;
            allWatchesTransactions.push(transaction);
        }

        // filter regarding newest owner for each watch
        let uniqueNewWatchesId = [];
        let uniqueNewWatchesTransactions = [];
        for (let i = allWatchesTransactions.length; i > 0; i--) {
            if (allWatchesTransactions[i - 1].transactionType === "newWatchOwner" && (uniqueNewWatchesId.indexOf(allWatchesTransactions[i - 1].uniqueId) === -1)) {
                uniqueNewWatchesId.push(allWatchesTransactions[i - 1].uniqueId);
                uniqueNewWatchesTransactions.push(allWatchesTransactions[i - 1]);
            }
        }

        //filter regarding owner
        let result = [];
        for (let trans of uniqueNewWatchesTransactions) {
            if (trans.owner === currentOwner) {
                result.push(trans);
            }
        }

        let resultAllTransactions = [];
        for (let trans of result) {
            let transactions = await ctx.stub.getState(trans.manufacturer + "-" + trans.watchId);
            let userTransactions = [];
            if (transactions.length !== 0) {
                transactions = JSON.parse(transactions);
                for (let transaction of transactions) {
                    userTransactions.push(transaction);
                }
            }
            resultAllTransactions.push(userTransactions);
        }

        return JSON.stringify(resultAllTransactions);
    }

    //get all watches
    async QueryAllWatches(ctx) {
        let transactions = await ctx.stub.getState(allWatchesTransactionKey);
        transactions = JSON.parse(transactions);
        let userTransactions = [];
        for (let transaction of transactions) {
            userTransactions.push(transaction);
        }
        return JSON.stringify(userTransactions);

    }

    //count all manufacturers
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

    //count all retailers
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

    //report a watch to be stolen
    async ReportStolen(ctx, executorName, watchId) {

        let transactions = await ctx.stub.getState(allStolenWatchesTransaction);
        let stolenWatchesTransactions = [];
        transactions = JSON.parse(transactions);
        let newTransaction = {};
        for (let transaction of transactions) {
            stolenWatchesTransactions.push(transaction);
        }
        if (stolenWatchesTransactions.length === 0) {
            let currentStolenWatchesList = [];
            currentStolenWatchesList.push(watchId);
            newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
            newTransaction.stolenWatchesList = currentStolenWatchesList;

            transactions.push(newTransaction);
        } else {
            let currentStolenWatchesList = [...stolenWatchesTransactions[stolenWatchesTransactions.length - 1].stolenWatchesList];
            let index = currentStolenWatchesList.indexOf(watchId);
            if (index === -1) {
                currentStolenWatchesList.push(watchId);

                newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction.stolenWatchesList = currentStolenWatchesList;

                transactions.push(newTransaction);
            } else {
                return;
            }
        }
        await ctx.stub.putState(allStolenWatchesTransaction, Buffer.from(JSON.stringify(transactions))); //push 
        return JSON.stringify(newTransaction);
    }

    async GetStolenWatches(ctx, executorName) {
        let transactions = await ctx.stub.getState(allStolenWatchesTransaction);
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            let stolenWatchesTransactions = [];
            for (let transaction of transactions) {
                stolenWatchesTransactions.push(transaction);
            }
            let lastStolenWatchesTransaction = stolenWatchesTransactions[stolenWatchesTransactions.length - 1];
            return JSON.stringify(lastStolenWatchesTransaction);
        }
    }

    //creates a transaction, that a watch was stolen
    async AddStolenEvent(ctx, executorName, watchId, manufacturerName, stolenInfo) {
        console.info('============= START : addReportSTolen ===========');
        //get chain for all Watches key
        let allWatchesTransaction = await ctx.stub.getState(allWatchesTransactionKey);
        allWatchesTransaction = JSON.parse(allWatchesTransaction);

        // get chain for specific watch
        let transactions = await ctx.stub.getState(manufacturerName + "-" + watchId);
        transactions = JSON.parse(transactions);

        //logic
        let allRecentWatchesOwnerChangedTransactions = [];

        for (let transaction of transactions) {
            if (transaction.transactionType === "newWatchOwner") {
                allRecentWatchesOwnerChangedTransactions.push(transaction);
            }
        }

        //get Information of last Transaction that watchowner was changed
        let oldOwnerChangedTransaction = allRecentWatchesOwnerChangedTransactions[allRecentWatchesOwnerChangedTransactions.length - 1];

        let newTransaction = {};

        newTransaction.info = stolenInfo;
        newTransaction.watchId = watchId;
        newTransaction.manufacturer = manufacturerName;
        newTransaction.verified_information = 'verified transaction!';
        newTransaction.transactionType = "StolenWatchReport"
        newTransaction.owner = oldOwnerChangedTransaction.owner;
        newTransaction.transaction_executor = executorName;
        newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
        newTransaction.transactionId = ctx.stub.txId;

        //push new Transaction to chain
        transactions.push(newTransaction);
        allWatchesTransaction.push(newTransaction);

        //submit new chain
        await ctx.stub.putState(manufacturerName + "-" + watchId, Buffer.from(JSON.stringify(transactions)));
        await ctx.stub.putState(allWatchesTransactionKey, Buffer.from(JSON.stringify(allWatchesTransaction)));
        console.info('============= END : addReportStolen ===========');
        return JSON.stringify(newTransaction);
    }

    //checks if a watch is stolen
    async IsWatchStolen(ctx, executorName, watchId) {
        let transactions = await ctx.stub.getState(allStolenWatchesTransaction);
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            let stolenWatchesTransactions = [];
            for (let transaction of transactions) {
                stolenWatchesTransactions.push(transaction);
            }
            let lastStolenWatchesTransaction = stolenWatchesTransactions[stolenWatchesTransactions.length - 1];
            if (lastStolenWatchesTransaction.indexOf(watchId) === -1) {
                return JSON.stringify(0);
            } else return JSON.stringify(1);
        }
    }

    // removes a watch from the stolen list
    async RemoveStolenWatch(ctx, executorName, watchId) {
        //Remove by manufacturer chain
        let transactions = await ctx.stub.getState(allStolenWatchesTransaction);
        let stolenWatchesTransactions = [];
        if (transactions.length != 0) {
            transactions = JSON.parse(transactions);
            for (let transaction of transactions) {
                stolenWatchesTransactions.push(transaction);
            }
            //get remove watchId
            let currentStolenWatchesList = [...stolenWatchesTransactions[stolenWatchesTransactions.length - 1].stolenWatchesList];
            let index = currentStolenWatchesList.indexOf(watchId);
            if (index != -1) {
                currentStolenWatchesList.splice(currentStolenWatchesList.indexOf(watchId), 1);

                let newTransaction = {};
                newTransaction.timestamp = new Date((ctx.stub.txTimestamp.seconds.low * 1000)).toGMTString();
                newTransaction.stolenWatchesList = currentStolenWatchesList;

                //push new Transaction to the chain
                transactions.push(newTransaction);
                await ctx.stub.putState(allStolenWatchesTransaction, Buffer.from(JSON.stringify(transactions))); //push 
                return JSON.stringify(newTransaction);
            }
        }
    }
}

module.exports = AntiCounterfeiting;
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// capture network variables from config.json
const configPath = path.join(process.cwd(), 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;
let gatewayDiscovery = config.gatewayDiscovery;

const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//export module
module.exports = {

    /*
  * Create Member participant and import card for identity
  * @param {String} cardId Import card id for member
  * @param {String} accountNumber Member account number as identifier on network
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
    registerMember: async function (cardId, accountNumber, firstName, lastName, email, phoneNumber) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            let response = {};


            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(cardId);
            if (userExists) {
                let err = `An identity for the user ${cardId} already exists in the wallet`;
                console.log(err);
                response.error = err;
                return response;
            }

            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists(appAdmin);
            if (!adminExists) {
                let err = 'An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying';
                console.log(err);
                response.error = err;
                return response;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

            // Get the CA client object from the gateway for interacting with the CA.
            const ca = gateway.getClient().getCertificateAuthority();
            const adminIdentity = gateway.getCurrentIdentity();

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: cardId, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: cardId, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
            wallet.import(cardId, userIdentity);
            console.log('Successfully registered and enrolled admin user ' + cardId + ' and imported it into the wallet');

            // Disconnect from the gateway.
            await gateway.disconnect();
            console.log('admin user admin disconnected');

        } catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

        await sleep(2000);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let member = {};
            member.accountNumber = accountNumber;
            member.firstName = firstName;
            member.lastName = lastName;
            member.email = email;
            member.phoneNumber = phoneNumber;
            member.points = 0;

            // Submit the specified transaction.
            console.log('\nSubmit Create Member transaction.');
            const createMemberResponse = await contract.submitTransaction('CreateMember', JSON.stringify(member));
            console.log('createMemberResponse: ');
            console.log(JSON.parse(createMemberResponse.toString()));

            console.log('\nGet member state ');
            const memberResponse = await contract.evaluateTransaction('GetState', accountNumber);
            console.log('memberResponse.parse_response: ');
            console.log(JSON.parse(memberResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Create Manufacturer participant and import card for identity
  * @param {String} email Manufacturer Id as identifier on network
  * @param {String} name Manufacturer name
  */
    registerManufacturer: async function (manufacturerName, password, email, phoneNumber, address, zipCode, place) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            let response = {};


            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(manufacturerName);
            if (userExists) {
                let err = `An identity for the user ${manufacturerName} already exists in the wallet`;
                console.log(err);
                response.error = err;
                return response;
            }

            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists(appAdmin);
            if (!adminExists) {
                let err = 'An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying';
                console.log(err);
                response.error = err;
                return response;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

            // Get the CA client object from the gateway for interacting with the CA.
            const ca = gateway.getClient().getCertificateAuthority();
            const adminIdentity = gateway.getCurrentIdentity();

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: manufacturerName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: manufacturerName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
            wallet.import(manufacturerName, userIdentity);
            console.log('Successfully registered and enrolled admin user ' + manufacturerName + ' and imported it into the wallet');
                        
            // Disconnect from the gateway.
            await gateway.disconnect();
            console.log('admin user admin disconnected');

        } catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

        await sleep(2000);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: manufacturerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let countM = await contract.evaluateTransaction('countAllManufacturers');
            countM = JSON.parse(countM.toString());
            countM = "M" + (countM+1);

            let manufacturer = {};
            manufacturer.id = countM;
            manufacturer.name = manufacturerName;
            manufacturer.password = password;
            manufacturer.email = email;
            manufacturer.phoneNumber = phoneNumber;
            manufacturer.address = address;
            manufacturer.zipCode = zipCode;
            manufacturer.place = place;

            // Submit the specified transaction.
            console.log('\nSubmit Create Manufacturer transaction.');
            const createManufacturerResponse = await contract.submitTransaction('CreateManufacturer', JSON.stringify(manufacturer));
            console.log('createManufacturerResponse: ');
            console.log(JSON.parse(createManufacturerResponse.toString()));

            console.log('\nGet manufacturer state ');
            const manufacturerResponse = await contract.evaluateTransaction('GetState', manufacturerName);
            console.log('manufacturerResponse.parse_response: ');
            console.log(JSON.parse(manufacturerResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform EarnPoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {Integer} points Points value
  */
    earnPointsTransaction: async function (cardId, accountNumber, manufacturerId, points) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let earnPoints = {};
            earnPoints.points = points;
            earnPoints.member = accountNumber;
            earnPoints.manufacturer = manufacturerId;

            // Submit the specified transaction.
            console.log('\nSubmit EarnPoints transaction.');
            const earnPointsResponse = await contract.submitTransaction('EarnPoints', JSON.stringify(earnPoints));
            console.log('earnPointsResponse: ');
            console.log(JSON.parse(earnPointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform UsePoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} manufacturerId Manufacturer Id of manufacturer
  * @param {Integer} points Points value
  */
    usePointsTransaction: async function (cardId, accountNumber, manufacturerId, points) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let usePoints = {};
            usePoints.points = points;
            usePoints.member = accountNumber;
            usePoints.manufacturer = manufacturerId;

            // Submit the specified transaction.
            console.log('\nSubmit UsePoints transaction.');
            const usePointsResponse = await contract.submitTransaction('UsePoints', JSON.stringify(usePoints));
            console.log('usePointsResponse: ');
            console.log(JSON.parse(usePointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
    memberData: async function (cardId, accountNumber) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log('\nGet member state ');
            let member = await contract.submitTransaction('GetState', accountNumber);
            member = JSON.parse(member.toString());
            console.log(member);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return member;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Manufacturer data
  * @param {String} cardId Card id to connect to network
  * @param {String} manufacturerId Manufacturer Id of manufacturer
  */
    manufacturerData: async function (cardId, manufacturerId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let manufacturer = await contract.submitTransaction('GetState', manufacturerId);
            manufacturer = JSON.parse(manufacturer.toString());
            console.log(manufacturer);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return manufacturer;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all manufacturers data
  * @param {String} cardId Card id to connect to network
  */
    allManufacturersInfo: async function (cardId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log('\nGet all manufacturers state ');
            let allManufacturers = await contract.evaluateTransaction('GetState', 'all-manufacturers');
            allManufacturers = JSON.parse(allManufacturers.toString());
            console.log(allManufacturers);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return allManufacturers;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
    },

    /*
  * Get all EarnPoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    earnPointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet earn points transactions state for ${userType} ${userId}`);
            let earnPointsTransactions = await contract.evaluateTransaction('EarnPointsTransactionsInfo', userType, userId);
            earnPointsTransactions = JSON.parse(earnPointsTransactions.toString());
            console.log(earnPointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return earnPointsTransactions;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all UsePoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    usePointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet use points transactions state for ${userType} ${userId}`);
            let usePointsTransactions = await contract.evaluateTransaction('UsePointsTransactionsInfo', userType, userId);
            usePointsTransactions = JSON.parse(usePointsTransactions.toString());
            console.log(usePointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return usePointsTransactions;
        }
        catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
    },

    // create car transaction
    createWatch: async function (watchId, model, color, cardId) {
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let newWatch = {};
            newWatch.owner = cardId;
            newWatch.manufacturer = cardId;
            newWatch.watchId = watchId;
            newWatch.model = model;
            newWatch.color = color;


            // Submit the specified transaction.
            // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
            let response = await contract.submitTransaction('CreateWatch', JSON.stringify(newWatch));
            console.log(JSON.parse(response.toString()));
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'createWatch Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // change watch owner transaction
    changeWatchOwner: async function (key, newOwner) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(userName);
            if (!userExists) {
                console.log('An identity for the user ' + userName + ' does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
                return response;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
            await contract.submitTransaction('changeWatchOwner', key, newOwner);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'changeWatchOwner Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // query all cars transaction
    queryAllWatches: async function (cardId, userType, userId) {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        
        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });
        
            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');
        
            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet watches transactions state for ${userType} ${userId}`);
            let result = await contract.evaluateTransaction('queryAllWatches', userType, userId);
            result = JSON.parse(result.toString());
            console.log(result);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return result;

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // query all cars transaction
    countAllManufacturers: async function(cardId) {

    let response = {};
    try {
        console.log('countAllManufacturers');

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('anticounterfeiting');

        // Evaluate the specified transaction.
        // countAllManufacturers transaction - requires no arguments, ex: ('countAllManufacturers')
        const result = await contract.evaluateTransaction('countAllManufacturers');
        //console.log('check6');
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}


};

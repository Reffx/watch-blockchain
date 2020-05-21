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
* Create Retailer participant and import card for identity
* @param {String} email Retailer Id as identifier on network
* @param {String} name Retailer name
*/
    registerRetailer: async function (RetailerName, password, email, phoneNumber, address, zipCode, place) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            let response = {};

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(RetailerName);
            if (userExists) {
                let err = `An identity for the user ${RetailerName} already exists in the wallet`;
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
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: RetailerName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: RetailerName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
            wallet.import(RetailerName, userIdentity);
            console.log('Successfully registered and enrolled admin user ' + RetailerName + ' and imported it into the wallet');

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
            await gateway2.connect(ccp, { wallet, identity: RetailerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let countR = await contract.evaluateTransaction('CountAllRetailers');
            countR = JSON.parse(countR.toString());
            countR = "R" + (countR + 1);

            let retailer = {};
            retailer.id = countR;
            retailer.name = RetailerName;
            retailer.password = password;
            retailer.email = email;
            retailer.phoneNumber = phoneNumber;
            retailer.address = address;
            retailer.zipCode = zipCode;
            retailer.place = place;

            // Submit the specified transaction.
            console.log('\nSubmit Create Retailer transaction.');
            const createRetailerResponse = await contract.submitTransaction('CreateRetailer', JSON.stringify(retailer));
            console.log('createRetailerResponse: ');
            console.log(JSON.parse(createRetailerResponse.toString()));

            console.log('\nGet retailer state ');
            const retailerResponse = await contract.evaluateTransaction('GetState', RetailerName);
            console.log('retailerResponse.parse_response: ');
            console.log(JSON.parse(retailerResponse.toString()));

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

            //   let countM = await contract.evaluateTransaction('CountAllManufacturers');
            //   countM = JSON.parse(countM.toString());
            //   countM = "M" + (countM+1);

            let manufacturer = {};
            //    manufacturer.id = countM;
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
    manufacturerData: async function (manufacturerName, password) {
        //todo: check pw before

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: manufacturerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let manufacturer = await contract.submitTransaction('GetLatestManufacturerInfo', manufacturerName);
            manufacturer = JSON.parse(manufacturer.toString());
            console.log(manufacturer);
            let latestManufacturerInfo = manufacturer[0];

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return latestManufacturerInfo;
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
* Get Retailer data
* @param {String} cardId Card id to connect to network
* @param {String} retailerId retailer Id of retailerName
*/
    retailerData: async function (retailerName, password) {
        //todo: check pw before

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: retailerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let retailer = await contract.submitTransaction('GetLatestRetailerInfo', retailerName);
            retailer = JSON.parse(retailer.toString());
            console.log(retailer);
            let latestRetailerInfo = retailer[0];

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return latestRetailerInfo;
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

    // create car transaction
    createWatch: async function (watchId, model, color, cardId) {
        let response = {};
        let result = {};
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

            let checkExistence = await contract.evaluateTransaction('CheckWatchExistence', cardId, watchId);
            checkExistence = JSON.parse(checkExistence.toString());
            if (checkExistence === 0) {
                let newWatch = {};
                newWatch.owner = cardId;
                newWatch.manufacturer = cardId;
                newWatch.watchId = watchId;
                newWatch.model = model;
                newWatch.color = color;
                // Submit the specified transaction.
                // createWatch transaction 
                result = await contract.submitTransaction('CreateWatch', JSON.stringify(newWatch));
                console.log(JSON.parse(result.toString()));
                console.log('Transaction has been submitted');
            } else {
                let err = 'A watch with this ID from that manufacturer exists already!';
                console.log(err);
                response.error = err;
                return response;
            }
            // Disconnect from the gateway.
            await gateway.disconnect();

            result.msg = 'createWatch Transaction has been submitted';
            return result;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // change watch owner transaction
    changeWatchOwner: async function (watchId, manufacturerName, oldOwner, newOwner) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: oldOwner, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
            await contract.submitTransaction('ChangeWatchOwner', watchId, manufacturerName, oldOwner, newOwner);
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

    // change watch owner transaction
    verifyRetailer: async function (manufacturerName, retailerName) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: manufacturerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
            await contract.submitTransaction('AddVerifiedRetailer', manufacturerName, retailerName);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'AddVerifiedRetailer Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // change watch owner transaction
    unverifyRetailer: async function (manufacturerName, retailerName) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: manufacturerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
            await contract.submitTransaction('RemoveVerifiedRetailer', manufacturerName, retailerName);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'AddVerifiedRetailer Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // query all cars transaction
    getVerifiedRetailers: async function (manufacturerName) {
        let response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: manufacturerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet watches transactions state for ${manufacturerName}`);
            let result = await contract.evaluateTransaction('GetVerifyRetailers', manufacturerName);
            if (result.length != 0) {
                result = JSON.parse(result.toString());
                console.log(result);
            } else {
                result = [];
            }
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
    queryMyWatches: async function (userId) {
        let response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: userId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet watches transactions state for ${userId}`);
            let result = await contract.evaluateTransaction('QueryMyWatches', userId);
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
    queryAllWatches: async function (cardId) {
        let response = {};

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

            console.log(`\nGet watches transactions state for ${cardId} ${cardId}`);
            let result = await contract.evaluateTransaction('QueryAllWatches');
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
    countAllManufacturers: async function (cardId) {

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
            const result = await contract.evaluateTransaction('CountAllManufacturers');
            //console.log('check6');
            //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

            return result;

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // query all cars transaction
    countAllRetailers: async function (cardId) {

        let response = {};
        try {
            console.log('countAllRetailers');

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
            const result = await contract.evaluateTransaction('CountAllRetailers');
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

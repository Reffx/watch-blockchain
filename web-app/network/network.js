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
  * @param {String} memberName as identifier on network
  * @param {String} password for member
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
    registerMember: async function (memberName, password, firstName, lastName, email, phoneNumber) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            let response = {};


            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(memberName);
            if (userExists) {
                let err = `An identity for the user ${memberName} already exists in the wallet`;
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
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: memberName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: memberName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
            wallet.import(memberName, userIdentity);
            console.log('Successfully registered and enrolled admin user ' + memberName + ' and imported it into the wallet');

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
            await gateway2.connect(ccp, { wallet, identity: memberName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            let member = {};
            member.name = memberName;
            member.password = password;
            member.firstName = firstName;
            member.lastName = lastName;
            member.email = email;
            member.phoneNumber = phoneNumber;

            // Submit the specified transaction.
            console.log('\nSubmit Create Member transaction.');
            const createMemberResponse = await contract.submitTransaction('CreateMember', JSON.stringify(member));
            console.log('createMemberResponse: ');
            console.log(JSON.parse(createMemberResponse.toString()));

            console.log('\nGet member state ');
            const memberResponse = await contract.evaluateTransaction('GetState', memberName);
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
    registerRetailer: async function (retailerName, password, email, phoneNumber, address, zipCode, place, country) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            let response = {};

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(retailerName);
            if (userExists) {
                let err = `An identity for the user ${retailerName} already exists in the wallet`;
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
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: retailerName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: retailerName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
            wallet.import(retailerName, userIdentity);
            console.log('Successfully registered and enrolled admin user ' + retailerName + ' and imported it into the wallet');

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
            await gateway2.connect(ccp, { wallet, identity: retailerName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // let countR = await contract.evaluateTransaction('CountAllRetailers');
            // countR = JSON.parse(countR.toString());
            // countR = "R" + (countR + 1);

            let retailer = {};
            retailer.name = retailerName;
            retailer.password = password;
            retailer.email = email;
            retailer.phoneNumber = phoneNumber;
            retailer.address = address;
            retailer.zipCode = zipCode;
            retailer.place = place;
            retailer.country = country;

            // Submit the specified transaction.
            console.log('\nSubmit Create Retailer transaction.');
            const createRetailerResponse = await contract.submitTransaction('CreateRetailer', JSON.stringify(retailer));
            console.log('createRetailerResponse: ');
            console.log(JSON.parse(createRetailerResponse.toString()));

            console.log('\nGet retailer state ');
            const retailerResponse = await contract.evaluateTransaction('GetState', retailerName);
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
    registerManufacturer: async function (manufacturerName, password, email, phoneNumber, address, zipCode, place, country) {

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

            let manufacturer = {};
            //    manufacturer.id = countM;
            manufacturer.name = manufacturerName;
            manufacturer.password = password;
            manufacturer.email = email;
            manufacturer.phoneNumber = phoneNumber;
            manufacturer.address = address;
            manufacturer.zipCode = zipCode;
            manufacturer.place = place;
            manufacturer.country = country;

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
  * @param {String} password to connect to network
  * @param {String} memberName of member
  */
    memberData: async function (memberName) {
        let response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: memberName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log('\nGet member state ');
            let member = await contract.submitTransaction('GetState', memberName);
            member = JSON.parse(member.toString());
            console.log(member);
            let latestMemberInfo = member[0];
            
            if (latestMemberInfo.userType != "member"){
                let err = 'This member is not registered!';
                console.log(err);
                response.error = err;
                return response;
            }
            // Disconnect from the gateway.
            await gateway2.disconnect();

            return latestMemberInfo;
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
  * @param {String} manufacturerId Manufacturer Id of manufacturer
  */
    manufacturerData: async function (manufacturerName) {
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

            let manufacturer = await contract.submitTransaction('GetLatestManufacturerInfo', manufacturerName);
            manufacturer = JSON.parse(manufacturer.toString());
            console.log(manufacturer);
            if (manufacturer.userType != "manufacturer"){
                let err = 'This manufacturer is not registered!';
                console.log(err);
                response.error = err;
                return response;
            }
            
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
    * Get Retailer data
    * @param {String} retailerId retailer Id of retailerName
    */
    retailerData: async function (retailerName) {
        let response = {};

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
            if (retailer.userType != "retailer"){
                let err = 'This retailer is not registered!';
                console.log(err);
                response.error = err;
                return response;
            }

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return retailer;
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
    createWatch: async function (watchId, cardId, attribut1, attribut2, attribut3, attribut4, attribut5) {
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
                newWatch.info = "Watch with ID " + watchId + " created by manufacturer " + cardId;
                newWatch.attribut1 = attribut1;
                newWatch.attribut2 = attribut2;
                newWatch.attribut3 = attribut3;
                newWatch.attribut4 = attribut4;
                newWatch.attribut5 = attribut5;
                newWatch.watchId = watchId;
                newWatch.transaction_executor = cardId;
                newWatch.verified_information = "verified transaction!";
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
    showSellInterest: async function (watchId, manufacturerName, owner, interestInformation) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: owner, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            await contract.submitTransaction('ShowSellInterest', watchId, manufacturerName, owner, interestInformation);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'ShowSellInterest Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // change watch owner transaction
    addMaintenance: async function (executorName, watchId, manufacturerName, maintenanceInfo, autenticityChecked) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: executorName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            if (typeof autenticityChecked === 'undefined') {
                autenticityChecked = 'false';
            } 
            // Submit the specified transaction.
            // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
            response = await contract.submitTransaction('AddMaintenanceEvent', executorName, watchId, manufacturerName, maintenanceInfo, autenticityChecked);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'Maintenance Transaction has been submitted';
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

    // query all Retailers that are verified by a specific manufacturer
    getVerifiedRetailersByManufacturer: async function (manufacturerName) {
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

            console.log(`\nGet all retailers that are verified by ${manufacturerName}`);
            let result = await contract.evaluateTransaction('GetVerifyRetailersByManufacturer', manufacturerName);
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

    // query all Manufacturers that verified a specific retailer
    getVerifiedRetailersByRetailer: async function (user, retailerName) {
        let response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: user, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet all Manufacturers that verified ${retailerName}`);
            let result = await contract.evaluateTransaction('GetVerifyRetailersByRetailer', retailerName);
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

    // 
    getMyWatches: async function (userId) {
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
            let result = await contract.evaluateTransaction('GetMyWatches', userId);
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

    // 
    getWatchSearch: async function (userId, manufacturerName, watchId) {
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
            let result = await contract.evaluateTransaction('QuerySingleWatch', manufacturerName, watchId);
            result = JSON.parse(result.toString());
            console.log(result);
            if (result === 0) { return [] }
            // Disconnect from the gateway.
            await gateway2.disconnect();

            return result;

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // 
    getRetailerSearch: async function (userId, retailerName) {
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
            let result = await contract.evaluateTransaction('GetLatestRetailerInfo', retailerName);
            result = JSON.parse(result.toString());
            console.log(result);
            if (result === 0) { return [] }
            // Disconnect from the gateway.
            await gateway2.disconnect();

            return result;

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // 
    getManufacturerSearch: async function (userId, ManufacturerName) {
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
            let result = await contract.evaluateTransaction('GetLatestManufacturerInfo', ManufacturerName);
            result = JSON.parse(result.toString());
            console.log(result);
            if (result === 0) { return [] }
            // Disconnect from the gateway.
            await gateway2.disconnect();

            return result;

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // 
    getMyWatchesAllTransactions: async function (userId) {
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
            let result = await contract.evaluateTransaction('GetMyWatchesAllTransactions', userId);
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

    // 
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

    // 
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

    // 
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
    },

    // change watch owner transaction
    reportStolen: async function (executorName, watchId) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: executorName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            await contract.submitTransaction('ReportStolen', executorName, watchId);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'ReportStolen Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // change watch owner transaction
    reportFound: async function (executorName, watchId) {
        let response = {};
        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), '/wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: executorName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            // Submit the specified transaction.
            await contract.submitTransaction('RemoveStolenWatch', executorName, watchId);
            console.log('Transaction has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

            response.msg = 'RemoveStolenWatch Transaction has been submitted';
            return response;

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            response.error = error.message;
            return response;
        }
    },

    // query all Retailers that are verified by a specific manufacturer
    getStolenWatches: async function (executorName) {
        let response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: executorName, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('anticounterfeiting');

            console.log(`\nGet all retailers that are verified by ${executorName}`);
            let result = await contract.evaluateTransaction('GetStolenWatches', executorName);
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


};

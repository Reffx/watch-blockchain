'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//create express web-app
const app = express();

//get the libraries to call
let network = require('./network/network.js');
let validate = require('./network/validate.js');
let analysis = require('./network/analysis.js');

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());

//get home page
app.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get member page
app.get('/member', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/member.html'));
});

//get member registration page
app.get('/registerMember', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/registerMember.html'));
});

//get manufacturer page
app.get('/manufacturer', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/manufacturer.html'));
});

//get retailer registration page
app.get('/registerRetailer', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/registerRetailer.html'));
});

//get retailer page
app.get('/retailer', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/retailer.html'));
});

//get manufacturer registration page
app.get('/registerManufacturer', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/registerManufacturer.html'));
});

//get about page
app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/about.html'));
});


//post call to register member on the network
app.post('/api/registerMember', function (req, res) {

    //declare variables to retrieve from request
    let memberName = req.body.memberName;
    let password = req.body.password;
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
    let email = req.body.email;
    let phoneNumber = req.body.phonenumber;

    //print variables
    console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' memberName: ' + memberName + ' password: ' + password);

    //validate member registration fields
    validate.validateMemberRegistration(memberName, password, firstName, lastName, email, phoneNumber)
        .then((response) => {
            //return error if error in response
            if (typeof response === 'object' && 'error' in response && response.error !== null) {
                res.json({
                    error: response.error
                });
                return;
            } else {
                //else register member on the network
                network.registerMember(memberName, password, firstName, lastName, email, phoneNumber)
                    .then((response) => {
                        //return error if error in response
                        if (typeof response === 'object' && 'error' in response && response.error !== null) {
                            res.json({
                                error: response.error
                            });
                        } else {
                            //else return success
                            res.json({
                                success: response
                            });
                        }
                    });
            }
        });
});

//post call to register retailer on the network
app.post('/api/registerRetailer', function (req, res) {

    //declare variables to retrieve from request
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let phoneNumber = req.body.phonenumber;
    let address = req.body.address;
    let zipCode = req.body.zipCode;
    let place = req.body.place;

    //print variables
    console.log('Using param - name: ' + name + ' email: ' + email);

    //validate retailer registration fields
    validate.validateInputRegistration(email, name, phoneNumber)
        .then((response) => {
            //return error if error in response
            if (typeof response === 'object' && 'error' in response && response.error !== null) {
                res.json({
                    error: response.error
                });
                return;
            } else {
                //else register manufacturer on the network
                network.registerRetailer(name, password, email, phoneNumber, address, zipCode, place)
                    .then((response) => {
                        //return error if error in response
                        if (typeof response === 'object' && 'error' in response && response.error !== null) {
                            res.json({
                                error: response.error
                            });
                        } else {
                            //else return success
                            res.json({
                                success: response
                            });
                        }
                    });
            }
        });

});

//post call to register manufacturer on the network
app.post('/api/registerManufacturer', function (req, res) {

    //declare variables to retrieve from request
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let phoneNumber = req.body.phonenumber;
    let address = req.body.address;
    let zipCode = req.body.zipCode;
    let place = req.body.place;

    //print variables
    console.log('Using param - name: ' + name + ' email: ' + email);

    //validate manufacturer registration fields
    validate.validateInputRegistration(email, name, phoneNumber)
        .then((response) => {
            //return error if error in response
            if (typeof response === 'object' && 'error' in response && response.error !== null) {
                res.json({
                    error: response.error
                });
                return;
            } else {
                //else register manufacturer on the network
                network.registerManufacturer(name, password, email, phoneNumber, address, zipCode, place)
                    .then((response) => {
                        //return error if error in response
                        if (typeof response === 'object' && 'error' in response && response.error !== null) {
                            res.json({
                                error: response.error
                            });
                        } else {
                            //else return success
                            res.json({
                                success: response
                            });
                        }
                    });
            }
        });

});

//post call to retrieve member data, transactions data and manufacturers to perform transactions with from the network
app.post('/api/memberData', function (req, res) {

    //declare variables to retrieve from request
    let memberName = req.body.memberName;
    let password = req.body.password;

    //print variables
    console.log('memberData using param - ' + ' memberName: ' + memberName + ' password: ' + password);

    //declare return object
    let returnData = {};

    //get member data from network
    network.memberData(memberName)
        .then((member) => {
            //return error if error in response
            if (typeof member === 'object' && 'error' in member && member.error !== null) {
                res.json({
                    error: member.error
                });
            } else {
                //else add member data to return object
                returnData.name = member.name;
                returnData.firstName = member.firstName;
                returnData.lastName = member.lastName;
                returnData.phoneNumber = member.phoneNumber;
                returnData.email = member.email;
            }
        })
        .then(() => {
            //get EarnPoints transactions from the network
            network.queryAllWatches(memberName)
                .then((queryAllWatchesResults) => {
                    //return error if error in response
                    if (typeof queryAllWatchesResults === 'object' && 'error' in queryAllWatchesResults && queryAllWatchesResults.error !== null) {
                        res.json({
                            error: queryAllWatchesResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.queryAllWatchesResults = queryAllWatchesResults;
                    }
                })
                .then(() => {
                    //get EarnPoints transactions from the network
                    network.getMyWatches(memberName)
                        .then((getMyWatchesResults) => {
                            //return error if error in response
                            if (typeof getMyWatchesResults === 'object' && 'error' in getMyWatchesResults && getMyWatchesResults.error !== null) {
                                res.json({
                                    error: getMyWatchesResults.error
                                });
                            } else {
                                //else add transaction data to return object
                                returnData.getMyWatchesResults = getMyWatchesResults;
                            }
                        }).then(() => {
                            //get manufacturers to transact with from the network
                            network.allManufacturersInfo(memberName)
                                .then((manufacturersInfo) => {
                                    //return error if error in response
                                    if (typeof manufacturersInfo === 'object' && 'error' in manufacturersInfo && manufacturersInfo.error !== null) {
                                        res.json({
                                            error: manufacturersInfo.error
                                        });
                                    } else {
                                        //else add manufacturers data to return object
                                        returnData.manufacturersData = manufacturersInfo;
                                    }

                                    //return returnData
                                    res.json(returnData);
                                });
                        });
                });
        });
});

//post call to retrieve manufacturer data and transactions data from the network
app.post('/api/manufacturerData', function (req, res) {

    //declare variables to retrieve from request
    let manufacturerName = req.body.manufacturerName;
    let password = req.body.password;

    //print variables
    console.log('manufacturerData using param - ' + ' manufacturerName: ' + manufacturerName + ' password: ' + password);

    //declare return object
    let returnData = {};

    //get manufacturer data from network
    network.manufacturerData(manufacturerName)
        .then((manufacturer) => {
            //return error if error in response
            if (typeof manufacturer === 'object' && 'error' in manufacturer && manufacturer.error !== null) {
                res.json({
                    error: manufacturer.error
                });
            } else {
                //else add manufacturer data to return object
                returnData.name = manufacturer.name;
                returnData.email = manufacturer.email;
            }

        })
        .then(() => {
            //get EarnPoints transactions from the network
            network.queryAllWatches(manufacturerName)
                .then((queryAllWatchesResults) => {
                    //return error if error in response
                    if (typeof queryAllWatchesResults === 'object' && 'error' in queryAllWatchesResults && queryAllWatchesResults.error !== null) {
                        res.json({
                            error: queryAllWatchesResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.queryAllWatchesResults = queryAllWatchesResults;
                    }
                })
                .then(() => {
                    //get EarnPoints transactions from the network
                    network.getMyWatches(manufacturerName)
                        .then((getMyWatchesResults) => {
                            //return error if error in response
                            if (typeof getMyWatchesResults === 'object' && 'error' in getMyWatchesResults && getMyWatchesResults.error !== null) {
                                res.json({
                                    error: getMyWatchesResults.error
                                });
                            } else {
                                //else add transaction data to return object
                                returnData.getMyWatchesResults = getMyWatchesResults;
                            }
                        })
                        .then(() => {
                            //get EarnPoints transactions from the network
                            network.getVerifiedRetailersByManufacturer(manufacturerName)
                                .then((getVerifiedRetailersResults) => {
                                    //return error if error in response
                                    if (typeof getVerifiedRetailersResults === 'object' && 'error' in getVerifiedRetailersResults && getVerifiedRetailersResults.error !== null) {
                                        res.json({
                                            error: getVerifiedRetailersResults.error
                                        });
                                    } else {
                                        //else add transaction data to return object
                                        returnData.getVerifiedRetailersResults = getVerifiedRetailersResults;
                                    }
                                })
                                .then(() => {
                                    //get EarnPoints transactions from the network
                                    network.countAllManufacturers(manufacturerName)
                                        .then((countManufacturersResults) => {
                                            //return error if error in response
                                            if (typeof countManufacturersResults === 'object' && 'error' in countManufacturersResults && countManufacturersResults.error !== null) {
                                                res.json({
                                                    error: countManufacturersResults.error
                                                });
                                            } else {
                                                //else add transaction data to return object
                                                returnData.countManufacturersResults = countManufacturersResults;
                                                //return returnData
                                                res.json(returnData);
                                            }
                                        });
                                });
                        });
                });
        });
});

//post call to retrieve manufacturer data and transactions data from the network
app.post('/api/retailerData', function (req, res) {

    //declare variables to retrieve from request
    let retailerName = req.body.retailerName;
    let password = req.body.password;

    //print variables
    console.log('retailerData using param - ' + ' retailerName: ' + retailerName + ' password: ' + password);

    //declare return object
    let returnData = {};

    //get manufacturer data from network
    network.retailerData(retailerName)
        .then((retailer) => {
            //return error if error in response
            if (typeof retailer === 'object' && 'error' in retailer && retailer.error !== null) {
                res.json({
                    error: manufacturer.error
                });
            } else {
                //else add manufacturer data to return object
                returnData.name = retailer.name;
                returnData.address = retailer.address
                returnData.zipCode = retailer.zipCode;
                returnData.email = retailer.email;
                returnData.phoneNumber = retailer.phoneNumber;
            }

        })
        .then(() => {
            //get EarnPoints transactions from the network
            network.queryAllWatches(retailerName)
                .then((queryAllWatchesResults) => {
                    //return error if error in response
                    if (typeof queryAllWatchesResults === 'object' && 'error' in queryAllWatchesResults && queryAllWatchesResults.error !== null) {
                        res.json({
                            error: queryAllWatchesResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.queryAllWatchesResults = queryAllWatchesResults;
                    }
                })
                .then(() => {
                    //get EarnPoints transactions from the network
                    network.getMyWatches(retailerName)
                        .then((getMyWatchesResults) => {
                            //return error if error in response
                            if (typeof getMyWatchesResults === 'object' && 'error' in getMyWatchesResults && getMyWatchesResults.error !== null) {
                                res.json({
                                    error: getMyWatchesResults.error
                                });
                            } else {
                                //else add transaction data to return object
                                returnData.getMyWatchesResults = getMyWatchesResults;
                            }
                        })
                        .then(() => {
                            //get EarnPoints transactions from the network
                            network.getVerifiedRetailersByRetailer(retailerName, retailerName)
                                .then((getManufacturersByVerifiedRetailerResults) => {
                                    //return error if error in response
                                    if (typeof getManufacturersByVerifiedRetailerResults === 'object' && 'error' in getManufacturersByVerifiedRetailerResults && getManufacturersByVerifiedRetailerResults.error !== null) {
                                        res.json({
                                            error: getManufacturersByVerifiedRetailerResults.error
                                        });
                                    } else {
                                        //else add transaction data to return object
                                        returnData.getManufacturersByVerifiedRetailerResults = getManufacturersByVerifiedRetailerResults;
                                    }
                                })
                                .then(() => {
                                    //get EarnPoints transactions from the network
                                    network.countAllRetailers(retailerName)
                                        .then((countRetailersResults) => {
                                            //return error if error in response
                                            if (typeof countRetailersResults === 'object' && 'error' in countRetailersResults && countRetailersResults.error !== null) {
                                                res.json({
                                                    error: countRetailersResults.error
                                                });
                                            } else {
                                                //else add transaction data to return object
                                                returnData.countRetailersResults = countRetailersResults;
                                                //return returnData
                                                res.json(returnData);
                                            }
                                        });
                                });
                        });
                });
        });
});

//post call to retrieve member data, transactions data and manufacturers to perform transactions with from the network
app.post('/api/allMyWatchesTransactions', function (req, res) {

    //declare variables to retrieve from request
    let name = req.body.name;

    //print variables
    console.log('memberData using param - ' + ' name: ' + name);

    //declare return object
    let returnData = {};

    //get EarnPoints transactions from the network
    network.getMyWatchesAllTransactions(name)
        .then((getMyWatchesAllTransactionsResults) => {
            //return error if error in response
            if (typeof getMyWatchesAllTransactionsResults === 'object' && 'error' in getMyWatchesAllTransactionsResults && getMyWatchesAllTransactionsResults.error !== null) {
                res.json({
                    error: getMyWatchesAllTransactionsResults.error
                });
            } else {
                //else add transaction data to return object
                returnData.getMyWatchesAllTransactionsResults = getMyWatchesAllTransactionsResults;
                res.json(returnData);
            }
        })

});

//post call to retrieve member data, transactions data and manufacturers to perform transactions with from the network
app.post('/api/verifiedRetailers', function (req, res) {

    //declare variables to retrieve from request
    let manufacturerName = req.body.manufacturerName;

    //print variables
    console.log('memberData using param - ' + ' manufacturerName: ' + manufacturerName);

    //declare return object
    let returnData = {};

    //get EarnPoints transactions from the network
    network.getVerifiedRetailersByManufacturer(manufacturerName)
        .then((getVerifiedRetailersResults) => {
            //return error if error in response
            if (typeof getVerifiedRetailersResults === 'object' && 'error' in getVerifiedRetailersResults && getVerifiedRetailersResults.error !== null) {
                res.json({
                    error: getVerifiedRetailersResults.error
                });
            } else {
                //else add transaction data to return object
                returnData.getVerifiedRetailersResults = getVerifiedRetailersResults;
                res.json(returnData);
            }
        })

});


app.post('/api/createWatch', (req, res) => {
    console.log(req.body);
    network.createWatch(req.body.watchId, req.body.model, req.body.color, req.body.owner)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/changeWatchOwner', (req, res) => {
    network.changeWatchOwner(req.body.watchId, req.body.manufacturerName, req.body.oldOwner, req.body.newOwner)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/addMaintenance', (req, res) => {
    network.addMaintenance(req.body.retailerName, req.body.watchId, req.body.manufacturerName, req.body.maintenanceInfo)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/verifyRetailer', (req, res) => {
    network.verifyRetailer(req.body.manufacturerName, req.body.retailerName)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/unverifyRetailer', (req, res) => {
    network.unverifyRetailer(req.body.manufacturerName, req.body.retailerName)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/searchWatch', (req, res) => {
    network.getWatchSearch(req.body.userId, req.body.manufacturerName, req.body.watchId)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/searchRetailer', (req, res) => {
    network.getRetailerSearch(req.body.userId, req.body.retailerName)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/searchManufacturer', (req, res) => {
    network.getManufacturerSearch(req.body.userId, req.body.manufacturerName)
        .then((response) => {
            res.send(response);
        });
});

//declare port
let port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
    port = process.env.PORT;
}

//run app on port
app.listen(port, function () {
    console.log('app running on port: %d', port);
});

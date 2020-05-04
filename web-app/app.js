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
    let accountNumber = req.body.accountnumber;
    let cardId = req.body.cardid;
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
    let email = req.body.email;
    let phoneNumber = req.body.phonenumber;

    //print variables
    console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

    //validate member registration fields
    validate.validateMemberRegistration(cardId, accountNumber, firstName, lastName, email, phoneNumber)
        .then((response) => {
            //return error if error in response
            if (typeof response === 'object' && 'error' in response && response.error !== null) {
                res.json({
                    error: response.error
                });
                return;
            } else {
                //else register member on the network
                network.registerMember(cardId, accountNumber, firstName, lastName, email, phoneNumber)
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
    let manufacturerName = req.body.manufacturerName;
    let password = req.body.password;
    let email = req.body.email;
    let phoneNumber = req.body.phonenumber;
    let address = req.body.address;
    let zipCode = req.body.zipCode;
    let place = req.body.place;

    //print variables
    console.log('Using param - name: ' + manufacturerName + ' email: ' + email);

    //validate manufacturer registration fields
    validate.validateManufacturerRegistration(email, manufacturerName, phoneNumber)
        .then((response) => {
            //return error if error in response
            if (typeof response === 'object' && 'error' in response && response.error !== null) {
                res.json({
                    error: response.error
                });
                return;
            } else {
                //else register manufacturer on the network
                network.registerManufacturer(manufacturerName, password, email, phoneNumber, address, zipCode, place)
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

//post call to perform EarnPoints transaction on the network
app.post('/api/earnPoints', function (req, res) {

    //declare variables to retrieve from request
    let accountNumber = req.body.accountnumber;
    let cardId = req.body.cardid;
    let manufacturerId = req.body.manufacturerid;
    let points = parseFloat(req.body.points);

    //print variables
    console.log('Using param - points: ' + points + ' manufacturerId: ' + manufacturerId + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

    //validate points field
    validate.validatePoints(points)
        .then((checkPoints) => {
            //return error if error in response
            if (typeof checkPoints === 'object' && 'error' in checkPoints && checkPoints.error !== null) {
                res.json({
                    error: checkPoints.error
                });
                return;
            } else {
                points = checkPoints;
                //else perforn EarnPoints transaction on the network
                network.earnPointsTransaction(cardId, accountNumber, manufacturerId, points)
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

//post call to perform UsePoints transaction on the network
app.post('/api/usePoints', function (req, res) {

    //declare variables to retrieve from request
    let accountNumber = req.body.accountnumber;
    let cardId = req.body.cardid;
    let manufacturerId = req.body.manufacturerid;
    let points = parseFloat(req.body.points);

    //print variables
    console.log('Using param - points: ' + points + ' manufacturerId: ' + manufacturerId + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

    //validate points field
    validate.validatePoints(points)
        //return error if error in response
        .then((checkPoints) => {
            if (typeof checkPoints === 'object' && 'error' in checkPoints && checkPoints.error !== null) {
                res.json({
                    error: checkPoints.error
                });
                return;
            } else {
                points = checkPoints;
                //else perforn UsePoints transaction on the network
                network.usePointsTransaction(cardId, accountNumber, manufacturerId, points)
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
    let accountNumber = req.body.accountnumber;
    let cardId = req.body.cardid;

    //print variables
    console.log('memberData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

    //declare return object
    let returnData = {};

    //get member data from network
    network.memberData(cardId, accountNumber)
        .then((member) => {
            //return error if error in response
            if (typeof member === 'object' && 'error' in member && member.error !== null) {
                res.json({
                    error: member.error
                });
            } else {
                //else add member data to return object
                returnData.accountNumber = member.accountNumber;
                returnData.firstName = member.firstName;
                returnData.lastName = member.lastName;
                returnData.phoneNumber = member.phoneNumber;
                returnData.email = member.email;
                returnData.points = member.points;
            }

        })
        .then(() => {
            //get UsePoints transactions from the network
            network.usePointsTransactionsInfo(cardId, 'member', accountNumber)
                .then((usePointsResults) => {
                    //return error if error in response
                    if (typeof usePointsResults === 'object' && 'error' in usePointsResults && usePointsResults.error !== null) {
                        res.json({
                            error: usePointsResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.usePointsResults = usePointsResults;
                    }

                }).then(() => {
                    //get EarnPoints transactions from the network
                    network.earnPointsTransactionsInfo(cardId, 'member', accountNumber)
                        .then((earnPointsResults) => {
                            //return error if error in response
                            if (typeof earnPointsResults === 'object' && 'error' in earnPointsResults && earnPointsResults.error !== null) {
                                res.json({
                                    error: earnPointsResults.error
                                });
                            } else {
                                //else add transaction data to return object
                                returnData.earnPointsResult = earnPointsResults;
                            }

                        })
                        .then(() => {
                            //get manufacturers to transact with from the network
                            network.allManufacturersInfo(cardId)
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
    network.manufacturerData(manufacturerName, password)
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
            network.queryAllWatches(manufacturerName, 'manufacturer', manufacturerName)
                .then((queryWatchesResults) => {
                    //return error if error in response
                    if (typeof queryWatchesResults === 'object' && 'error' in queryWatchesResults && queryWatchesResults.error !== null) {
                        res.json({
                            error: queryWatchesResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.queryWatchesResults = queryWatchesResults;
                    }
                 });
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
                    }
                 });
        })
        .then(() => {
            //get UsePoints transactions from the network
            network.usePointsTransactionsInfo(manufacturerName, 'manufacturer', manufacturerName)
                .then((usePointsResults) => {
                    //return error if error in response
                    if (typeof usePointsResults === 'object' && 'error' in usePointsResults && usePointsResults.error !== null) {
                        res.json({
                            error: usePointsResults.error
                        });
                    } else {
                        //else add transaction data to return object
                        returnData.usePointsResults = usePointsResults;
                        //add total points collected by manufacturer to return object
                        returnData.pointsCollected = analysis.totalPointsCollected(usePointsResults);
                    }
                })
                .then(() => {
                    //get EarnPoints transactions from the network
                    network.earnPointsTransactionsInfo(manufacturerName, 'manufacturer', manufacturerName)
                        .then((earnPointsResults) => {
                            //return error if error in response
                            if (typeof earnPointsResults === 'object' && 'error' in earnPointsResults && earnPointsResults.error !== null) {
                                res.json({
                                    error: earnPointsResults.error
                                });
                            } else {
                                //else add transaction data to return object
                                returnData.earnPointsResults = earnPointsResults;
                                //add total points given by manufacturer to return object
                                returnData.pointsGiven = analysis.totalPointsGiven(earnPointsResults);
                                //return returnData
                                res.json(returnData);
                            }       
                        })
                        //moves here in
                });
        });

});

app.post('/api/createWatch', (req, res) => {
    console.log(req.body);
    network.createWatch(req.body.watchId, req.body.model, req.body.color, req.body.owner)
        .then((response) => {
            res.send(response);
        });
});

app.post('/api/changeWatchOwner', (req, res) => {
    network.changeWatchOwner(req.body.watchId, req.body.newOwner)
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

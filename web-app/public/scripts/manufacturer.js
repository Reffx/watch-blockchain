'use strict';

let apiUrl = location.protocol + '//' + location.host + '/api/';

//check user input and call server
function updateManufacturer() {

    //get user input data
    let formManufacturerName = $('.manufacturerName input').val();
    let formPassword = $('.password input').val();

    //create json data
    let inputData = '{' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"password" : "' + formPassword + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'manufacturerData',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {

                //update heading
                $('.heading').html(function () {
                    let str = '<h2><b> ' + data.name + ' </b></h2>';
                    str = str + '<h2><b> ' + data.email + ' </b></h2>';

                    return str;
                });

                //update dashboard
                $('.dashboards').html(function () {
                    let str = '';
                    str = str + '<div class="jumbotron" style="display:block;">';
                    str = str + '<h3>Account information</h3>';
                    str = str + '<h5>' + data.name + '</h5>';
                    str = str + '<h5>' + data.address + " " + data.zipCode + '</h5>';
                    str = str + '<h5>' + data.place + '</h5>';
                    str = str + '<h5>' + data.country + '</h5>';
                    str = str + '<br>';
                    str = str + '<h5>' + data.email + ' </h5>';
                    str = str + '<h5>' + data.phoneNumber + ' </h5>';
                    str = str + '</div>';

                    let transactionData = data.getMyWatchesResults;
                    if (transactionData.length > 0) {
                        str = str + '<div class="jumbotron" style="display:block;">';
                        str = str + '<h3>My watches</h3>';
                    }
                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<h5>' + transactionData[i].manufacturer + ': ' + transactionData[i].watchId + '</h5>';
                    }
                    if (transactionData.length > 0) {
                        str = str + '</div>';
                    }
                    return str;
                });


                //update use points transaction
                $('.query-watches-transactions').html(function () {
                    let str = '';
                    let transactionData = data.queryAllWatchesResults;
                    console.log(data.queryAllWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />';
                        str = str + 'info: ' + transactionData[i].info + '<br />';
                        str = str + 'owner: ' + transactionData[i].owner + '<br />';
                        str = str + 'Manufacturer: ' + transactionData[i].manufacturer + '<br />';
                        str = str + 'WatchId: ' + transactionData[i].watchId + '<br />';
                        str = str + 'attribut1: ' + transactionData[i].attribut1 + '<br />';
                        str = str + 'attribut2: ' + transactionData[i].attribut2 + '<br />';
                        str = str + 'attribut3: ' + transactionData[i].attribut3 + '<br />';
                        str = str + 'attribut4: ' + transactionData[i].attribut4 + '<br />';
                        str = str + 'attribut5: ' + transactionData[i].attribut5 + '<br />';
                        str = str + 'transactionType: ' + transactionData[i].transactionType + '<br />';
                        str = str + 'transactionExecutor: ' + transactionData[i].transaction_executor + '<br />';
                        str = str + 'InformationVerification: ' + transactionData[i].verified_information + '<br />';
                        str = str + 'transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update use points transaction
                $('.verifiedRetailersBox').html(function () {
                    let str = '';
                    let transactionData = data.getVerifiedRetailersResults;
                    console.log(data.getVerifiedRetailersResults);
                    if (transactionData.length != 0) {
                        for (let i = 0; i < transactionData.retailerList.length; i++) {
                            str = str + '<p>Your verified Retailers: ' + transactionData.retailerList[i] + '<br /></p><br>';
                        }
                    }
                    return str;
                });

                //update manufacturers dropdown for earn points transaction
                $('.sell-myWatch-id select').html(function () {
                    let str = '<option value="" disabled="" selected="">select</option>';
                    let transactionData = data.getMyWatchesResults;
                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<option sell-my-watch-id=' + transactionData[i].manufacturer + "*+$+*" + transactionData[i].watchId + '> ' + transactionData[i].manufacturer + ": " + transactionData[i].watchId + '</option>';
                    }
                    return str;
                });

                //update use points transaction
                $('.get-myWatches-transactions').html(function () {
                    let str = '';
                    let stolenDisplay = '';
                    let stolenDisplay2 = '';
                    let stolenWatches = [];
                    if (data.getStolenWatchesResults.length != 0) {
                        stolenWatches = data.getStolenWatchesResults.stolenWatchesList;
                    } 
                    let transactionData = data.getMyWatchesResults;
                    console.log(data.getMyWatchesResults);
                    for (let i = 0; i < transactionData.length; i++) {
                        if (stolenWatches.indexOf(transactionData[i].watchId) === -1) {
                            stolenDisplay = "block";
                            stolenDisplay2 = "none";
                        } else {
                            stolenDisplay = "none";
                            stolenDisplay2 = "block";
                        }
                        str = str + '<p class="myWatch' + i + '" style="margin-bottom:0px;">manufacturer: ' + transactionData[i].manufacturer + '<br />Watch ID: ' + transactionData[i].watchId + '</p> <button class="btn btn-primary" style="margin-top:5px; margin-bottom:5px;" onclick="specificWatchTransactions(' + i + ')">Show transactions</button> <button class="btn btn-primary" style="margin-top:5px; margin-bottom:5px;" onclick="specificVerifiedRetailers(\'' + transactionData[i].manufacturer + '\')">Show verified retailers</button> <button  class="btn btn-primary" style="margin-top:5px; background:red; border:none; margin-bottom:5px; display:' + stolenDisplay + ';" onclick="reportStolen(\'' + transactionData[i].watchId + '\')">Report as stolen</button> <button  class="btn btn-primary" style="margin-top:5px; background:green; border:none; margin-bottom:5px; display:' + stolenDisplay2 + ';" onclick="reportAsFound(\'' + transactionData[i].watchId + '\')">Report as found</button> <br> <hr>';
                    }
                    return str;
                });


                //remove login section
                document.getElementById('loginSection').style.display = 'none';
                //display transaction section
                document.getElementById('transactionSection').style.display = 'block';
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);

            location.reload();
        }
    });
};

//check user input and call server
$('.sign-in-manufacturer').click(function () {
    updateManufacturer();
});

//check user input and call server
$('.create-watch').click(function () {

    //get user input data
    let formWatchId = $('.watchid-id input').val();
    let formAttribut1 = $('.attribut1-id input').val();
    let formAttribut2 = $('.attribut2-id input').val();
    let formAttribut3 = $('.attribut3-id input').val();
    let formAttribut4 = $('.attribut4-id input').val();
    let formAttribut5 = $('.attribut5-id input').val();
    let formModel = 'legacy';
    let formColor = 'legacy2';
    let formOwner = $('.manufacturerName input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"attribut1" : "' + formAttribut1 + '", ' + '"attribut2" : "' + formAttribut2 + '", ' + '"attribut3" : "' + formAttribut3 + '", ' + '"attribut4" : "' + formAttribut4 + '", ' + '"attribut5" : "' + formAttribut5 + '", ' + '"model" : "' + formModel + '", ' + '"color" : "' + formColor + '", ' + '"owner" : "' + formOwner + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'createWatch',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            document.getElementById('loader').style.display = 'none';
            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                //update member page and notify successful transaction
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }


        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
});

//check user input and call server
$('.sell-watch').click(function () {

    //select logic
    let formManufacturerAndWatchId = $('.sell-myWatch-id select').find(':selected').attr('sell-my-watch-id');
    if (!formManufacturerAndWatchId) {
        alert('Select watch first');
        return;
    }
    let res = formManufacturerAndWatchId.split("*+$+*");

    let formWatchId = res[1];
    let formManufacturerName = res[0];
    let formOwner = $('.newOwner-id input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"oldOwner" : "' + formManufacturerName + '", ' + '"newOwner" : "' + formOwner + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'changeWatchOwner',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            document.getElementById('loader').style.display = 'none';
            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                //update member page and notify successful transaction
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }


        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
});

//check user input and call server
$('.verify-retailer').click(function () {

    //get user input data
    let formVerifyRetailer = $('.verify-retailer-id input').val();
    let formManufacturerName = $('.manufacturerName input').val();

    //create json data
    let inputData = '{' + '"retailerName" : "' + formVerifyRetailer + '", ' + '"manufacturerName" : "' + formManufacturerName + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'verifyRetailer',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            document.getElementById('loader').style.display = 'none';
            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                //update member page and notify successful transaction
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
});

//check user input and call server
$('.unverify-retailer').click(function () {

    //get user input data
    let formVerifyRetailer = $('.unverify-retailer-id input').val();
    let formManufacturerName = $('.manufacturerName input').val();

    //create json data
    let inputData = '{' + '"retailerName" : "' + formVerifyRetailer + '", ' + '"manufacturerName" : "' + formManufacturerName + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'unverifyRetailer',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            document.getElementById('loader').style.display = 'none';
            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                //update member page and notify successful transaction
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });

});

//might be moved trough refactoring to basic.js
function specificVerifiedRetailers(manufacturerName) {

    //create json data
    let inputData = '{' + '"manufacturerName" : "' + manufacturerName + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'verifiedRetailers',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {

                //update use points transaction
                $('.get-myWatches-all-transactions').html(function () {
                    let str = '';
                    let transactionData = data.getVerifiedRetailersResults.retailerList;
                    console.log(data.getMyWatchesResults);
                    if (transactionData.length === 0) {
                        str = str + '<h3>' + manufacturerName + ' has no verified retailers. ' + ' </h3> <br>';
                    } else {
                        str = str + '<h3>Retailers verified by ' + manufacturerName + '</h3> <br>';
                        str = str + '<p class="retailers">';
                        for (let i = 0; i < transactionData.length; i++) {
                            str = str + '<button class="btn" style="background:black; color:white; margin:5px;" onclick="getRetailerInfo(\'' + transactionData[i] + '\')">' + transactionData[i] + "</button>";
                        }
                        str = str + '</p>';
                    }
                    return str;
                });
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        },
        complete: function () {

        }
    });
}

//might be moved to basic.js through refactoring
function reportStolen(watchId) {

    let formManufacturerName = $('.manufacturerName input').val();

    //create json data
    let inputData = '{' + '"executorName" : "' + formManufacturerName + '", ' + '"watchId" : "' + watchId + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'reportStolen',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        },
        complete: function () {

        }
    });
}

function reportAsFound(watchId) {

    let formManufacturerName = $('.manufacturerName input').val();

    //create json data
    let inputData = '{' + '"executorName" : "' + formManufacturerName + '", ' + '"watchId" : "' + watchId + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'reportFound',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function (data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {
                // createWatch();
                alert('Transaction successful');
                updateManufacturer();
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        },
        complete: function () {

        }
    });
}

//might be moved to basics.js by refactoring
function getRetailerInfo(name) {
    var txt = document.getElementById("searchRetailerInput");
    txt.value = name;
    document.getElementById("searchRetailerButton").click();
    $("#searchRetailer-tab").trigger("click");
}
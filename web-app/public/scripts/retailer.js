'use strict';

let apiUrl = location.protocol + '//' + location.host + '/api/';

//check user input and call server
function updateRetailer() {
    //get user input data
    let formRetailerName = $('.retailerName input').val();
    let formPassword = $('.password input').val();

    //create json data
    let inputData = '{' + '"retailerName" : "' + formRetailerName + '", ' + '"password" : "' + formPassword + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'retailerData',
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
                $('.get-myWatches-transactions').html(function () {
                    let str = '';
                    let transactionData = data.getMyWatchesResults;
                    console.log(data.getMyWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />owner: ' + transactionData[i].owner + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color +  '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update manufacturers dropdown for earn points transaction
                $('.maintenance-manufacturer-id select').html(function() {
                    let str = '<option value="" disabled="" selected="">select</option>';
                    if (data.getManufacturersByVerifiedRetailerResults.length != 0){
                    let transactionData = data.getManufacturersByVerifiedRetailerResults.manufacturerList;
                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<option manufacturer-id=' + transactionData[i] + '> ' + transactionData[i] + '</option>';
                    }
                    }
                    return str;
                });

                //update manufacturers dropdown for earn points transaction
                $('.sell-myWatch-id select').html(function() {
                    let str = '<option value="" disabled="" selected="">select</option>';
                    let transactionData = data.getMyWatchesResults;
                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<option sell-my-watch-id=' +transactionData[i].manufacturer + "*+$+*" + transactionData[i].watchId + '> ' + transactionData[i].manufacturer + ": " + transactionData[i].watchId + '</option>';
                    }
                    return str;
                });

                //update use points transaction
                $('.query-watches-transactions').html(function () {
                    let str = '';
                    let transactionData = data.queryAllWatchesResults;
                    console.log(data.queryAllWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />owner: ' + transactionData[i].owner + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color +  '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update use points transaction
                $('.get-myWatches-transactions').html(function () {
                    let str = '';
                    let stolenDisplay = '';
                    let stolenDisplay2 = '';
                    let stolenWatches = data.getStolenWatchesResults.stolenWatchesList;
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
$('.add-maintenance').click(function () {

    //get user input data
    let formRetailerName = $('.retailerName input').val();
    let formWatchId = $('.maintenance-watchid-id input').val();
    let formInfo = $('.maintenance-info-id input').val();
    let formManufacturerName = $('.maintenance-manufacturer-id select').find(':selected').attr('manufacturer-id');
    if (!formManufacturerName) {
        alert('Select manufacturer first');
        return;
    }

    //create json data
    let inputData = '{' + '"executorName" : "' + formRetailerName + '", ' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"maintenanceInfo" : "' + formInfo + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'addMaintenance',
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
                //update retailer page and notify successful transaction
                alert('Transaction successful');
                updateRetailer();
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
$('.sign-in-retailer').click(function() {
    updateRetailer();
});

//check user input and call server
$('.sell-watch').click(function() {
    
    //select logic
    let formManufacturerAndWatchId = $('.sell-myWatch-id select').find(':selected').attr('sell-my-watch-id');
    if (!formManufacturerAndWatchId) {
        alert('Select watch first');
        return;
    }
    let res = formManufacturerAndWatchId.split("*+$+*");

    let formRetailerName = $('.retailerName input').val();
    let formManufacturerName = res[0];
    let formWatchId = res[1];
    let formOwner = $('.newOwner-id input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"oldOwner" : "' + formRetailerName + '", ' + '"newOwner" : "' + formOwner + '"}';
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
                //update retailer page and notify successful transaction
                alert('Transaction successful');
                updateRetailer();
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

//might be moved trough refactoring to basic.js
function specificWatchTransactions(y) {

    //get user input data
    let name = $('.retailerName input').val();

    //create json data
    let inputData = '{' + '"name" : "' + name + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'allMyWatchesTransactions',
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
                    let transactionData = data.getMyWatchesAllTransactionsResults[y];
                    console.log(data.getMyWatchesResults);

                    str = str + '<h3>All transactions of watch ' + transactionData[0].watchId + '</h3>';

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />info: ' + transactionData[i].info + '<br />owner: ' + transactionData[i].owner + '<br />Manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color + '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionExecutor: ' + transactionData[i].transaction_executor + '<br />InformationVerification: ' + transactionData[i].verified_information + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';


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

    let formRetailerName = $('.retailerName input').val();

    //create json data
    let inputData = '{' + '"executorName" : "' + formRetailerName + '", ' + '"watchId" : "' + watchId + '"}';
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
                updateRetailer();
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

    let formRetailerName = $('.retailerName input').val();

    //create json data
    let inputData = '{' + '"executorName" : "' + formRetailerName + '", ' + '"watchId" : "' + watchId + '"}';
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
                updateRetailer();
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
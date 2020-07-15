'use strict';

let apiUrl2 = location.protocol + '//' + location.host + '/api/';

//check user input and call server
$('.search-watch').click(function () {
    let formUserId;

    if (typeof $('.memberName input').val() != 'undefined') {
        formUserId = $('.memberName input').val();
    }
    if (typeof $('.retailerName input').val() != 'undefined') {
        formUserId = $('.retailerName input').val();
    }
    if (typeof $('.manufacturerName input').val() != 'undefined') {
        formUserId = $('.manufacturerName input').val();
    }

    //select logic
    let formManufacturerName = $('.searchWatchManufacturerName-id input').val();
    let formWatchId = $('.searchWatchWatchId-id input').val();


    //create json data
    let inputData = '{' + '"userId" : "' + formUserId + '", ' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl2 + 'searchWatch',
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
                //update use points transaction
                $('.get-searchWatches-transactions').html(function () {
                    let str = '';
                    let transactionData = data;
                    console.log(data.getMyWatchesResults);
                    if (transactionData.length === 0) {
                        str = '<h3>No watch from this manufacturer with this watch ID found!</h3>';
                    } else {
                        str = '<div style="background:#e9ecef; width:100%;  border-radius:0.3rem; padding:20px;">'
                        str = str + '<h3>All transactions of watch ' + transactionData[0].watchId + '</h3>';
                    }
                    for (let i = 0; i < transactionData.length; i++) {
                        if (transactionData[i].transactionType === 'newWatchOwner') {
                            str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />';
                            str = str + 'info: ' + transactionData[i].info + '<br />';
                            str = str + 'owner: ' + transactionData[i].owner + '<br />';
                            str = str + 'manufacturer: ' + transactionData[i].manufacturer + '<br />';
                            str = str + 'watch-ID: ' + transactionData[i].watchId + '<br />';
                            if (transactionData[i].attribut1 != '') { str = str + 'attribut1: ' + transactionData[i].attribut1 + '<br />'; }
                            if (transactionData[i].attribut2 != '') { str = str + 'attribut2: ' + transactionData[i].attribut2 + '<br />'; }
                            if (transactionData[i].attribut3 != '') { str = str + 'attribut3: ' + transactionData[i].attribut3 + '<br />'; }
                            if (transactionData[i].attribut4 != '') { str = str + 'attribut4: ' + transactionData[i].attribut4 + '<br />'; }
                            if (transactionData[i].attribut5 != '') { str = str + 'attribut5: ' + transactionData[i].attribut5 + '<br />'; }
                            str = str + 'transactionType: ' + transactionData[i].transactionType + '<br />';
                            str = str + 'transaction-executor: ' + transactionData[i].transaction_executor + '<br />';
                            str = str + 'information-verification: ' + transactionData[i].verified_information + '<br />';
                            str = str + 'transaction-ID: ' + transactionData[i].transactionId + '</p><br>';
                        } else {
                            str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />';
                            str = str + 'info: ' + transactionData[i].info + '<br />';
                            str = str + 'owner: ' + transactionData[i].owner + '<br />';
                            str = str + 'manufacturer: ' + transactionData[i].manufacturer + '<br />';
                            str = str + 'watch-ID: ' + transactionData[i].watchId + '<br />';
                            str = str + 'transactionType: ' + transactionData[i].transactionType + '<br />';
                            str = str + 'transaction-executor: ' + transactionData[i].transaction_executor + '<br />';
                            str = str + 'information-verification: ' + transactionData[i].verified_information + '<br />';
                            str = str + 'transaction-ID: ' + transactionData[i].transactionId + '</p><br>';
                        }
                    }
                    return str;
                });
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
$('.search-retailer').click(function searchRetailer() {
    let formUserId;

    if (typeof $('.memberName input').val() != 'undefined') {
        formUserId = $('.memberName input').val();
    }
    if (typeof $('.retailerName input').val() != 'undefined') {
        formUserId = $('.retailerName input').val();
    }
    if (typeof $('.manufacturerName input').val() != 'undefined') {
        formUserId = $('.manufacturerName input').val();
    }

    //select logic
    let formRetailerName = $('.searchRetailerName-id input').val();

    if (formRetailerName.length < 1) {
        alert("Enter a retailer!");
    } else {

        //create json data
        let inputData = '{' + '"userId" : "' + formUserId + '", ' + '"retailerName" : "' + formRetailerName + '"}';
        console.log(inputData);

        //make ajax call
        $.ajax({
            type: 'POST',
            url: apiUrl2 + 'searchRetailer',
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
                    //update use points transaction
                    $('.get-searchRetailer-transactions').html(function () {
                        let str = '';
                        let transactionData = data;
                        console.log(data.getMyWatchesResults);
                        if (transactionData.length === 0 || transactionData.userType != "retailer") {
                            str = '<h3>No retailer with this name found!</h3>';
                        } else {
                            str = '<div style="background:#e9ecef; width:100%;  border-radius:0.3rem; padding:20px;">'
                            str = str + '<h3>Information about ' + transactionData.name + '</h3>';
                            str = str + '<p>' + transactionData.name + '</p>';
                            str = str + '<p> ' + transactionData.address + '</p>';
                            str = str + '<p> ' + transactionData.zipCode + " " + transactionData.place + '</p>';
                            str = str + '<br>';
                            str = str + '<p> ' + transactionData.email + '</p>';
                            str = str + '<p> ' + transactionData.phoneNumber + '</p>';
                        }
                        str = str + '</div>'
                        return str;
                    });
                }


            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error: Try again');
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            }
        });
    }
});

//check user input and call server
$('.search-manufacturer').click(function searchManufacturer() {
    let formUserId;

    if (typeof $('.memberName input').val() != 'undefined') {
        formUserId = $('.memberName input').val();
    }
    if (typeof $('.retailerName input').val() != 'undefined') {
        formUserId = $('.retailerName input').val();
    }
    if (typeof $('.manufacturerName input').val() != 'undefined') {
        formUserId = $('.manufacturerName input').val();
    }

    //select logic
    let formManufacturerName = $('.searchManufacturerName-id input').val();

    if (formManufacturerName.length < 1) {
        alert("Enter a manufacturer!");
    } else {

    //create json data
    let inputData = '{' + '"userId" : "' + formUserId + '", ' + '"manufacturerName" : "' + formManufacturerName + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl2 + 'searchManufacturer',
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
                //update use points transaction
                $('.get-searchManufacturer-transactions').html(function () {
                    let str = '';
                    let transactionData = data;
                    console.log(data.getMyWatchesResults);
                    if (transactionData.length === 0 || transactionData.userType != "manufacturer") {
                        str = '<h3>No manufacturer with this name found!</h3>';
                    } else {
                        str = '<div style="background:#e9ecef; width:100%;  border-radius:0.3rem; padding:20px;">'
                        str = str + '<h3>Information about ' + transactionData.name + '</h3>';
                        str = str + '<p>' + transactionData.name + '</p>';
                        str = str + '<p> ' + transactionData.address + '</p>';
                        str = str + '<p> ' + transactionData.zipCode + " " + transactionData.place + '</p>';
                        str = str + '<br>';
                        str = str + '<p> ' + transactionData.email + '</p>';
                        str = str + '<p> ' + transactionData.phoneNumber + '</p>';
                    }
                    str = str + '</div>'
                    return str;
                });
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
    }
});

//used functions by member.js
function printNewWatchOwnerTransaction(trans) {
    let str = '';
    str = str + '<p>timeStamp: ' + trans.timestamp + '<br />';
    str = str + 'info: ' + trans.info + '<br />';
    str = str + 'owner: ' + trans.owner + '<br />';
    str = str + 'manufacturer: ' + trans.manufacturer + '<br />';
    str = str + 'watch-ID: ' + trans.watchId + '<br />';
    if (trans.attribut1 != '') { str = str + 'attribut1: ' + trans.attribut1 + '<br />'; }
    if (trans.attribut2 != '') { str = str + 'attribut2: ' + trans.attribut2 + '<br />'; }
    if (trans.attribut3 != '') { str = str + 'attribut3: ' + trans.attribut3 + '<br />'; }
    if (trans.attribut4 != '') { str = str + 'attribut4: ' + trans.attribut4 + '<br />'; }
    if (trans.attribut5 != '') { str = str + 'attribut5: ' + trans.attribut5 + '<br />'; }
    str = str + 'transaction-type: ' + trans.transactionType + '<br />';
    str = str + 'transaction-executor: ' + trans.transaction_executor + '<br />';
    str = str + 'information-verification: ' + trans.verified_information + '<br />';
    str = str + 'transaction-ID: ' + trans.transactionId + '</p><br>';
    return str;
};

function printMaintenanceEventTransaction(trans) {
    let str = '';
    str = str + '<p>timeStamp: ' + trans.timestamp + '<br />';
    str = str + 'info: ' + trans.info + '<br />';
    str = str + 'owner: ' + trans.owner + '<br />';
    str = str + 'manufacturer: ' + trans.manufacturer + '<br />';
    str = str + 'transaction-type: ' + trans.transactionType + '<br />';
    str = str + 'transaction-executor: ' + trans.transaction_executor + '<br />';
    str = str + 'information-verification: ' + trans.verified_information + '<br />';
    str = str + 'transaction-ID: ' + trans.transactionId + '</p><br>';
    return str;
};

function printStolenEventTransaction(trans) {
    let str = '';
    str = str + '<p>timeStamp: ' + trans.timestamp + '<br />';
    str = str + 'info: ' + trans.info + '<br />';
    str = str + 'owner: ' + trans.owner + '<br />';
    str = str + 'manufacturer: ' + trans.manufacturer + '<br />';
    str = str + 'transaction-type: ' + trans.transactionType + '<br />';
    str = str + 'transaction-executor: ' + trans.transaction_executor + '<br />';
    str = str + 'information-verification: ' + trans.verified_information + '<br />';
    str = str + 'transaction-ID: ' + trans.transactionId + '</p><br>';
    return str;
};

function specificWatchTransactions(y) {
    //get user input data
    let name;

    if (typeof $('.memberName input').val() != 'undefined') {
        name = $('.memberName input').val();
    }
    if (typeof $('.retailerName input').val() != 'undefined') {
        name = $('.retailerName input').val();
    }
    if (typeof $('.manufacturerName input').val() != 'undefined') {
        name = $('.manufacturerName input').val();
    }

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
                        if (transactionData[i].transactionType === 'newWatchOwner') {
                            str = str + printNewWatchOwnerTransaction(transactionData[i]);
                        } else if (transactionData[i].transactionType === 'maintenanceEvent') {
                            str = str + printMaintenanceEventTransaction(transactionData[i]);
                        } else {
                            str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />';
                            str = str + 'info: ' + transactionData[i].info + '<br />';
                            str = str + 'owner: ' + transactionData[i].owner + '<br />';
                            str = str + 'manufacturer: ' + transactionData[i].manufacturer + '<br />';
                            str = str + 'watch-ID: ' + transactionData[i].watchId + '<br />';
                            if (transactionData[i].attribut1 != '') { str = str + 'attribut1: ' + transactionData[i].attribut1 + '<br />'; }
                            if (transactionData[i].attribut2 != '') { str = str + 'attribut2: ' + transactionData[i].attribut2 + '<br />'; }
                            if (transactionData[i].attribut3 != '') { str = str + 'attribut3: ' + transactionData[i].attribut3 + '<br />'; }
                            if (transactionData[i].attribut4 != '') { str = str + 'attribut4: ' + transactionData[i].attribut4 + '<br />'; }
                            if (transactionData[i].attribut5 != '') { str = str + 'attribut5: ' + transactionData[i].attribut5 + '<br />'; }
                            str = str + 'transaction-type: ' + transactionData[i].transactionType + '<br />';
                            str = str + 'transaction-executor: ' + transactionData[i].transaction_executor + '<br />';
                            str = str + 'information-verification: ' + transactionData[i].verified_information + '<br />';
                            str = str + 'transaction-ID: ' + transactionData[i].transactionId + '</p><br>';
                        }
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
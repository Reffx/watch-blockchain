'use strict';

let apiUrl2 = location.protocol + '//' + location.host + '/api/';

//check user input and call server
$('.search-watch').click(function() {
    let formUserId;

    if ($('.memberName input').val() != ""){
        formUserId = $('.memberName input').val();
    }
    if ($('.retailerName input').val() != ""){
        formUserId = $('.retailerName input').val();
    }
    if ($('.manufacturerName input').val() != ""){
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
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />info: ' + transactionData[i].info + '<br />owner: ' + transactionData[i].owner + '<br />Manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color + '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionExecutor: ' + transactionData[i].transaction_executor + '<br />InformationVerification: ' + transactionData[i].verified_information +'<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
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
});

//check user input and call server
$('.search-retailer').click(function searchRetailer() {
    let formUserId;

    if ($('.memberName input').val() != ""){
        formUserId = $('.memberName input').val();
    }
    if ($('.retailerName input').val() != ""){
        formUserId = $('.retailerName input').val();
    }
    if ($('.manufacturerName input').val() != ""){
        formUserId = $('.manufacturerName input').val();
    }

    //select logic
    let formRetailerName = $('.searchRetailerName-id input').val();


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
                    if (transactionData.length === 0) {
                        str = '<h3>No retailer with this name found!</h3>';
                    } else {
                        str = '<div style="background:#e9ecef; width:100%;  border-radius:0.3rem; padding:20px;">'
                        str = str + '<h3>Information about ' + transactionData.name + '</h3>';
                        str = str + '<p>'+ transactionData.name +'</p>';
                        str = str + '<p> '+ transactionData.address +'</p>';
                        str = str + '<p> '+ transactionData.zipCode + " " + transactionData.place +'</p>';
                        str = str + '<br>';
                        str = str + '<p> '+ transactionData.email +'</p>';
                        str = str + '<p> '+ transactionData.phoneNumber +'</p>';
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
});

//check user input and call server
$('.search-manufacturer').click(function searchManufacturer() {
    let formUserId;

    if ($('.memberName input').val() != ""){
        formUserId = $('.memberName input').val();
    }
    if ($('.retailerName input').val() != ""){
        formUserId = $('.retailerName input').val();
    }
    if ($('.manufacturerName input').val() != ""){
        formUserId = $('.manufacturerName input').val();
    }

    //select logic
    let formManufacturerName = $('.searchManufacturerName-id input').val();


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
                    if (transactionData.length === 0) {
                        str = '<h3>No manufacturer with this name found!</h3>';
                    } else {
                        str = '<div style="background:#e9ecef; width:100%;  border-radius:0.3rem; padding:20px;">'
                        str = str + '<h3>Information about ' + transactionData.name + '</h3>';
                        str = str + '<p>'+ transactionData.name +'</p>';
                        str = str + '<p> '+ transactionData.address +'</p>';
                        str = str + '<p> '+ transactionData.zipCode + " " + transactionData.place +'</p>';
                        str = str + '<br>';
                        str = str + '<p> '+ transactionData.email +'</p>';
                        str = str + '<p> '+ transactionData.phoneNumber +'</p>';
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
});

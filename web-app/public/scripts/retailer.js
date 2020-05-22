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
                    str = str + '<h5>Total points allocated to customers: ' + data.pointsGiven + ' </h5>';
                    str = str + '<h5>Total points redeemed by customers: ' + data.pointsCollected + ' </h5>';
                    return str;
                });

                //update use points transaction
                $('.query-myWatches-transactions').html(function () {
                    let str = '';
                    let transactionData = data.queryMyWatchesResults;
                    console.log(data.queryMyWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />owner: ' + transactionData[i].owner + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color +  '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update manufacturers dropdown for earn points transaction
                $('.maintenance-manufacturer-id select').html(function() {
                    let str = '<option value="" disabled="" selected="">select</option>';
                    let transactionData = data.queryMyWatchesResults;
                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<option manufacturer-id=' + transactionData[i].manufacturer + '> ' + transactionData[i].manufacturer + '</option>';
                    }
                    return str;
                });

                //update manufacturers dropdown for earn points transaction
                $('.sell-myWatch-id select').html(function() {
                    let str = '<option value="" disabled="" selected="">select</option>';
                    let transactionData = data.queryMyWatchesResults;
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
    let inputData = '{' + '"retailerName" : "' + formRetailerName + '", ' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"maintenanceInfo" : "' + formInfo + '"}';
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
                //update member page and notify successful transaction
                // createWatch();
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
                //update member page and notify successful transaction
                // createWatch();
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

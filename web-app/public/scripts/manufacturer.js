'use strict';

let apiUrl = location.protocol + '//' + location.host + '/api/';

//check user input and call server
function updateManufacturer() {

    //get user input data
    let formManufacturerName= $('.manufacturerName input').val();
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
        beforeSend: function() {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                alert(data.error);
                return;
            } else {

                //update heading
                $('.heading').html(function() {
                    let str = '<h2><b> ' + data.name + ' </b></h2>';
                    str = str + '<h2><b> ' + data.email + ' </b></h2>';

                    return str;
                });

                //update dashboard
                $('.dashboards').html(function() {
                    let str = '';
                    str = str + '<h5>Total points allocated to customers: ' + data.pointsGiven + ' </h5>';
                    str = str + '<h5>Total points redeemed by customers: ' + data.pointsCollected + ' </h5>';
                    return str;
                });

                //update earn points transaction
                $('.points-allocated-transactions').html(function() {
                    let str = '';
                    let transactionData = data.earnPointsResults;

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />member: ' + transactionData[i].member + '<br />points: ' + transactionData[i].points + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update use points transaction
                $('.points-redeemed-transactions').html(function() {
                    let str = '';
                    let transactionData = data.usePointsResults;

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />member: ' + transactionData[i].member + '<br />points: ' + transactionData[i].points + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //update use points transaction
                $('.query-watches-transactions').html(function() {
                    let str = '';
                    let transactionData = data.queryWatchesResults;
                    console.log(data.queryWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />owner: ' + transactionData[i].owner + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });

                //remove login section
                document.getElementById('loginSection').style.display = 'none';
                //display transaction section
                document.getElementById('transactionSection').style.display = 'block';
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
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
$('.sign-in-manufacturer').click(function() {
    updateManufacturer();
});

//check user input and call server
$('.create-watch').click(function() {

    //get user input data
    let formWatchId = $('.watchid-id input').val();
    let formModel = $('.model-id input').val();
    let formColor = $('.color-id input').val();
    let formOwner = $('.manufacturerName input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"model" : "' + formModel + '", ' + '"color" : "' + formColor + '", ' + '"owner" : "' + formOwner + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'createWatch',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

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
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
});

//check user input and call server
$('.sell-watch').click(function() {

    //get user input data
    let formWatchId = $('.sell-watchid-id input').val();
    let formManufacturerName = $('.manufacturerName input').val();
    let formOwner = $('.newOwner-id input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"oldOwner" : "' + formManufacturerName + '", ' + '"newOwner" : "' + formOwner + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'changeWatchOwner',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
            //display loading
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

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
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
});
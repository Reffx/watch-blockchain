'use strict';

let apiUrl = location.protocol + '//' + location.host + '/api/';

function updateMember() {

    //get user input data
    let formMemberName = $('.memberName input').val();
    let formPassword = $('.password input').val();

    //create json data
    let inputData = '{' + '"memberName" : "' + formMemberName + '", ' + '"password" : "' + formPassword + '"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
        type: 'POST',
        url: apiUrl + 'memberData',
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
                    let str = '<h2><b>' + data.firstName + ' ' + data.lastName + '</b></h2>';
                    str = str + '<h2><b>' + data.name + '</b></h2>';

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
                $('.query-myWatches-transactions').html(function () {
                    let str = '';
                    let transactionData = data.getMyWatchesResults;
                    console.log(data.getMyWatchesResults);

                    for (let i = 0; i < transactionData.length; i++) {
                        str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />owner: ' + transactionData[i].owner + '<br />manufacturer: ' + transactionData[i].manufacturer + '<br />WatchId: ' + transactionData[i].watchId + '<br />model: ' + transactionData[i].model + '<br />color: ' + transactionData[i].color +  '<br />transactionType: ' + transactionData[i].transactionType + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
                    }
                    return str;
                });



                //remove login section and display member page
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('transactionSection').style.display = 'block';
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        },
        complete: function() {

        }
    });
}

//check user input and call server
$('.sign-in-member').click(function() {
    updateMember();
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

    let formMemberName = $('.memberName input').val();
    let formManufacturerName = res[0];
    let formWatchId = res[1];
    let formOwner = $('.newOwner-id input').val();


    //create json data
    let inputData = '{' + '"watchId" : "' + formWatchId + '", ' + '"manufacturerName" : "' + formManufacturerName + '", ' + '"oldOwner" : "' + formMemberName + '", ' + '"newOwner" : "' + formOwner + '"}';
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
                updateMember();
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

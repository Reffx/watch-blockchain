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

                // //update manufacturers dropdown for earn points transaction
                // $('.earn-manufacturer select').html(function() {
                //     let str = '<option value="" disabled="" selected="">select</option>';
                //     let manufacturersData = data.manufacturersData;
                //     for (let i = 0; i < manufacturersData.length; i++) {
                //         str = str + '<option manufacturer-id=' + manufacturersData[i].id + '> ' + manufacturersData[i].name + '</option>';
                //     }
                //     return str;
                // });

                // //update manufacturers dropdown for use points transaction
                // $('.use-manufacturer select').html(function() {
                //     let str = '<option value="" disabled="" selected="">select</option>';
                //     let manufacturersData = data.manufacturersData;
                //     for (let i = 0; i < manufacturersData.length; i++) {
                //         str = str + '<option manufacturer-id=' + manufacturersData[i].id + '> ' + manufacturersData[i].name + '</option>';
                //     }
                //     return str;
                // });

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

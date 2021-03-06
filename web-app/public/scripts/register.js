'use strict';

let apiUrl = location.protocol + '//' + location.host + '/api/';

console.log('at register.js');

//check user input and call server to create dataset
$('.register-member').click(function() {

    //get user input data
    let formMemberName = $('.memberName input').val();
    let formPassword = $('.password input').val();
    let formFirstName = $('.first-name input').val();
    let formLastName = $('.last-name input').val();
    let formEmail = $('.email input').val();
    let formPhoneNumber = $('.phone-number input').val();

    //create json data
    let inputData = '{' + '"firstname" : "' + formFirstName + '", ' + '"lastname" : "' + formLastName + '", ' + '"email" : "' + formEmail + '", ' + '"phonenumber" : "' + formPhoneNumber + '", ' + '"memberName" : "' + formMemberName + '", ' + '"password" : "' + formPassword + '"}';
    console.log(inputData);

    //make ajax call to add the dataset
    $.ajax({
        type: 'POST',
        url: apiUrl + 'registerMember',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
            //display loading
            document.getElementById('registration').style.display = 'none';
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                document.getElementById('registration').style.display = 'block';
                alert(data.error);
                return;
            } else {
                //notify successful registration
                document.getElementById('successful-registration').style.display = 'block';
                document.getElementById('registration-info').style.display = 'none';
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });

});

//check user input and call server to create dataset
$('.register-retailer').click(function() {

    //get user input data
    let formName = $('.name input').val();
    let formPassword = $('.password input').val();
    let formEmail = $('.email input').val();
    let formPhoneNumber = $('.phone-number input').val();
    let formAddress = $('.address input').val();
    let formZipCode = $('.zipCode input').val();
    let formPlace = $('.place input').val();
    let formCountry = $('.country input').val();

    //create json data
    let inputData = '{' + '"name" : "' + formName + '", ' + '"password" : "' + formPassword + '", ' + '"email" : "' + formEmail + '", ' + '"phonenumber" : "' + formPhoneNumber + '", ' + '"address" : "' + formAddress + '", ' + '"zipCode" : "' + formZipCode + '", ' + '"place" : "' + formPlace + '", ' +  '"country" : "' + formCountry + '"}';
    console.log(inputData);

    registerRetailer(inputData);

});

function registerRetailer(inputData){
    //make ajax call to add the dataset
    $.ajax({
        type: 'POST',
        url: apiUrl + 'registerRetailer',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
            //display loading
            document.getElementById('registration').style.display = 'none';
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                document.getElementById('registration').style.display = 'block';
                alert(data.error);
                return;
            } else {
                //notify successful registration
                document.getElementById('successful-registration').style.display = 'block';
                document.getElementById('registration-info').style.display = 'none';
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
}



//check user input and call server to create dataset
$('.register-manufacturer').click(function() {

    //get user input data
    let formName = $('.name input').val();
    let formPassword = $('.password input').val();
    let formEmail = $('.email input').val();
    let formPhoneNumber = $('.phone-number input').val();
    let formAddress = $('.address input').val();
    let formZipCode = $('.zipCode input').val();
    let formPlace = $('.place input').val();
    let formCountry = $('.country input').val();

    //create json data
    let inputData = '{' + '"name" : "' + formName + '", ' + '"password" : "' + formPassword + '", ' + '"email" : "' + formEmail + '", ' + '"phonenumber" : "' + formPhoneNumber + '", ' + '"address" : "' + formAddress + '", ' + '"zipCode" : "' + formZipCode + '", ' + '"place" : "' + formPlace + '", ' + '"country" : "' + formCountry + '"}';
    console.log(inputData);

    registerManufacturer(inputData);

});

function registerManufacturer(inputData){
    //make ajax call to add the dataset
    $.ajax({
        type: 'POST',
        url: apiUrl + 'registerManufacturer',
        data: inputData,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
            //display loading
            document.getElementById('registration').style.display = 'none';
            document.getElementById('loader').style.display = 'block';
        },
        success: function(data) {

            //remove loader
            document.getElementById('loader').style.display = 'none';

            //check data for error
            if (data.error) {
                document.getElementById('registration').style.display = 'block';
                alert(data.error);
                return;
            } else {
                //notify successful registration
                document.getElementById('successful-registration').style.display = 'block';
                document.getElementById('registration-info').style.display = 'none';
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            //reload on error
            alert('Error: Try again');
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
}

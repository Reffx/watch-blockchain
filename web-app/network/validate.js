'use strict';

//stackoverflow
function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value));
}

//stackoverflow
function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//stackoverflow
function validatePhoneNumber(phoneNumber) {
    let re = /^[+]?[(]?[0-9]{3}[)]?[ \s.]?[0-9]{3}[ \s.]?[0-9]{2,4}[ \s.]?[0-9]{2,4}$/;
    return re.test(String(phoneNumber));
}

module.exports = {

    /*
  * Validata member registration fields ensuring the fields meet the criteria
  * @param {String} password
  * @param {String} memberName
  * @param {String} firstName
  * @param {String} lastName
  * @param {String} phoneNumber
  * @param {String} email
  */
    validateMemberRegistration: async function (memberName, password, firstName, lastName, email, phoneNumber) {

        let response = {};

        return response;
        //verify input otherwise return error with an informative message
        if (memberName.length < 6) {
            response.error = 'Member name must be at least six digits long';
            console.log(response.error);
            return response;
        } else if (!isInt(memberName)) {
            response.error = 'Member name  must be all numbers';
            console.log(response.error);
            return response;
        } else if (memberName.length > 25) {
            response.error = 'Member name  must be less than 25 digits';
            console.log(response.error);
            return response;
        } else if (password.length < 1) {
            response.error = 'Enter access key';
            console.log(response.error);
            return response;
        } else if (!/^[0-9a-zA-Z]+$/.test(password)) {
            response.error = 'Card id can be letters and numbers only';
            console.log(response.error);
            return response;
        } else if (firstName.length < 1) {
            response.error = 'Enter first name';
            console.log(response.error);
            return response;
        } else if (!/^[a-zA-Z]+$/.test(firstName)) {
            response.error = 'First name must be letters only';
            console.log(response.error);
            return response;
        } else if (lastName.length < 1) {
            response.error = 'Enter last name';
            console.log(response.error);
            return response;
        } else if (!/^[a-zA-Z]+$/.test(lastName)) {
            response.error = 'First name must be letters only';
            console.log(response.error);
            return response;
        } else if (email.length < 1) {
            response.error = 'Enter email';
            console.log(response.error);
            return response;
        } else if (!validateEmail(email)) {
            response.error = 'Enter valid email';
            console.log(response.error);
            return response;
        } else if (phoneNumber.length < 1) {
            response.error = 'Enter phone number';
            console.log(response.error);
            return response;
        } else if (!validatePhoneNumber(phoneNumber)) {
            response.error = 'Enter valid phone number';
            console.log(response.error);
            return response;
        } else {
            console.log('Valid Entries');
            return response;
        }

    },

    /*
  * Validata manufacturer/retailer registration fields ensuring the fields meet the criteria
  */
    validateInputRegistration: async function (email, name, phoneNumber) {

        let response = {};
        //weil nervig atm
        return response;
        //verify input otherwise return error with an informative message
        if (email.length < 1) {
            response.error = 'Enter email';
            console.log(response.error);
            return response;
        } else if (!validateEmail(email)) {
            response.error = 'Enter valid email';
            console.log(response.error);
            return response;
        } else if (name.length < 1) {
            response.error = 'Enter company name';
            console.log(response.error);
            return response;
        } else if (!/^[a-zA-Z]+$/.test(name)) {
            response.error = 'Company name must be letters only';
            console.log(response.error);
            return response;
        } else if (!validatePhoneNumber(phoneNumber)) {
            response.error = 'Enter valid phone number';
            console.log(response.error);
            return response;
        } else {
            console.log('Valid Entries');
            return response;
        }

    },

};
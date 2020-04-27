[![Build Status](https://travis-ci.org/IBM/customer-loyalty-program-hyperledger-fabric-VSCode.svg?branch=master)](https://travis-ci.org/IBM/customer-loyalty-program-hyperledger-fabric-VSCode)

## Anti Counterfeigt Program

idea blablabla...


## Architecture Flow

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72646158-7367dc80-3943-11ea-8d9e-63f79367b95a.png">
</p>

**Note** The blockchain network will have multiple members and manufacturers

1. Member is registered on the network
2. Member can sign-in to make transactions to earn points, redeem points and view their transactions
3. Manufacturer is registered on the network
4. Manufacturer can sign-in to view their transactions and display dashboard


## Included Components

*	[IBM Blockchain Platform](https://www.ibm.com/cloud/blockchain-platform) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) is designed to assist users in developing, testing, and deploying smart contracts -- including connecting to Hyperledger Fabric environments.


## Featured technology
+ [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
+ [Node.js](https://nodejs.org/en/) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
+ [Express.js](https://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
+ [Bootstrap](https://getbootstrap.com/) Bootstrap is an open source toolkit for developing with HTML, CSS, and JS.


## Running the application locally

Follow these steps to set up and run this code pattern.


### Prerequisites

You will need to follow the requirements for the [IBM Blockchain Platform Extension for VS Code](https://github.com/IBM-Blockchain/blockchain-vscode-extension/blob/master/README.md#requirements):

- [VSCode version 1.38.0 or greater](https://code.visualstudio.com)
- [Node v8.x or v10.x and npm v6.x or greater](https://nodejs.org/en/download/)
- [Docker version v17.06.2-ce or greater](https://www.docker.com/get-docker)
- [Docker Compose v1.14.0 or greater](https://docs.docker.com/compose/install/)


### Steps
1. [Clone the repo](#1-clone-the-repo)
2. [Package the smart contract](#2-package-the-smart-contract)
3. [Setup network locally and deploy the smart contract](#3-setup-network-locally-and-deploy-the-smart-contract)
4. [Run the application](#4-run-the-application)


#### 1. Clone the repo

Clone this repository in a folder your choice:

```bash
git clone https://github.com/IBM/customer-loyalty-program-hyperledger-fabric-VSCode.git
cd customer-loyalty-program-hyperledger-fabric-VSCode
```


#### 2. Package the smart contract

We will use the IBM Blockchain Platform Extension for VSCode to package the customerloyalty smart contract.

* Open Visual Studio code and open the `contract` folder from this repository that was cloned earlier.

Press the `F1` key to see the different VS code options. Choose `IBM Blockchain Platform: Package Open Project`.

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910509-05036d00-3140-11ea-8b15-7c8aeb403974.png">
</p>

Click the `IBM Blockchain Platform` extension button on the left. This will show the packaged contracts on top and the blockchain connections on the bottom.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72647360-64365e00-3946-11ea-81de-f023ac83aaa2.png">
</p>


#### 3. Setup network locally and deploy the smart contract

You should see `FABRIC ENVIRONMENTS` on the left side of the editor. Under this section, you should see `Local Fabric`. Click it to start the Local Fabric.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72647777-5208ef80-3947-11ea-89f3-1aedc042f7b7.png">
</p>

The extension will now provision the Docker containers that will act as nodes in your network. Once the provisioning is finished and the network is up and running, you will see the options to install and instantiate the smart contract, the `Channels` information, the `Nodes` and the organization msps under `Organizations`. You are now ready to install the smart contract.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72297496-0ba35000-362a-11ea-9f37-e5819b0dd751.png">
</p>


* In the `FABRIC ENVIRONMENTS` section near the bottom, click on `Smart Contracts` > `Installed` > `+ Install`.  You will see a pop-up similar to the graphic below. 

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72647002-75329f80-3945-11ea-910d-ba0d03582e20.png">
</p>

* Then select the packaged contract: `customerloyalty@0.0.1 Packaged`  **Note** The 0.0.1 comes from your `package.json` line:  `"version": "0.0.1"`

After the install is complete, you should get a message `Successfully installed on peer peer0.org1.example.com`.  You should also see that the contract is listed under `Installed` under `FABRIC ENVIRONMENTS`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72647027-87acd900-3945-11ea-9b9c-b08b4df7e0db.png">
</p>


* Under **Smart Contracts** you will see a section that says **Instantiated**. Click on `+ Instantiate` under it.

* The extension will then ask you which contract and version to instantiate — choose `customerloyalty@0.0.1 Installed`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72647057-998e7c00-3945-11ea-8c2a-efa9a81320ff.png">
</p>

* The extension will then ask you which function to call on instantiate — type in `instantiate`

<p align="center">
  <img width="500" width="300" src="https://user-images.githubusercontent.com/8854447/72641008-149c6600-3937-11ea-9598-43004c3d8b76.png">
</p>

* Next, it will ask you for the arguments to the function. There are none, so just hit enter.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641072-43b2d780-3937-11ea-8cbc-ab4e757367d1.png">
</p>

* Next, the extension will then ask you do you want to use a provide a private data collection configuration file? - Click on `No`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641080-4a414f00-3937-11ea-8f2b-37b85090fd6c.png">
</p>

* Lastly, the extension will then ask you do you want to choose a smart contract endorsement policy. Choose `Default (single endorser, any org)`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641101-53322080-3937-11ea-89f8-4db2f23a8b27.png">
</p>

Once instantiation of the contract completes, you should get the message `Successfully instantiated smart contract` and you should see `customerloyalty@0.0.1` under `Instantiated` under `FABRIC ENVIRONMENTS`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72648095-1d496800-3948-11ea-9619-d2c5eab47a02.png">
</p>


#### 4. Run the application

* #### Enroll admin

  - First, navigate to the `web-app` directory, and install the node dependencies.
    ```bash
    cd web-app/
    npm install
    ```

  - Run the `enrollAdmin.js` script
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:
    ```bash
    msg: Successfully enrolled admin user app-admin and imported it into the wallet
    ```

* #### Run the application server

  - From the `web-app` directory, start the server.

    ```bash
    npm start
    ```

You can find the app running at http://localhost:8000/

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72647296-3bae6400-3946-11ea-9998-80c5f8c5a82c.png">
</p>
<br>


## Links
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [IBM Code Patterns for Blockchain](https://developer.ibm.com/patterns/category/blockchain/)


## License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)

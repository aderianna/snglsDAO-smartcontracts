const GenesisProtocol = artifacts.require("GenesisProtocol");
const GenericSchemeContract = artifacts.require("UGenericScheme");
const FeeContract = artifacts.require("Fee");
const getDeployedAddress = require("./getDeployedAddress");
const Avatar = artifacts.require("Avatar");
const migration = require("../data/migration.json");
const assert = require('assert').strict;

contract("Fee", async accounts => {
    const feesAndTestValues = {
        "validation": 9,
        "listing": 7,
        "transaction": 8,
        "membership": 11
    };
    let GenesisProtocolInstance;
    let GenericSchemeInstance;
    let FeeInstance;
    before(async () => {
        let chainId = await web3.eth.net.getId();
        let network;
        if (chainId === 4) network = "rinkeby";
        else network = "private";
        //"0.0.1-rc.32" - this property can be changed in future
        const GenericSchemeAddress = migration[network].base["0.0.1-rc.32"].UGenericScheme;
        GenericSchemeInstance = await GenericSchemeContract.at(GenericSchemeAddress);
        FeeInstance = await FeeContract.at(await getDeployedAddress("Fee"));
        AvatarInstance = await Avatar.at(await getDeployedAddress("Avatar"));
    });
    for (const fee in feesAndTestValues) {
        if (feesAndTestValues.hasOwnProperty(fee)) {
            let k = 0;
            let testValue = feesAndTestValues[fee];
            it(`Set ${fee} fee`, async () => {
                await GenericSchemeInstance.proposeCall(AvatarInstance.address, encodeFeeChangeCall(fee, testValue), '0', `0`);
            });
        }
    }
});

function encodeFeeChangeCall(feeName, newFee) {
    return web3.eth.abi.encodeFunctionCall({
        name: `set${feeName[0].toUpperCase()+feeName.slice(1).toLowerCase()}Fee`,
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: `_${feeName.toLowerCase()}Fee`
        }]
    }, [newFee]);
}
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Bar{

    address public admin;
    constructor() {
        admin = msg.sender;
    }
    mapping(address => mapping(string => uint)) public entityCertificates;

    mapping(address => mapping(string => uint)) public userCertificates;

    function assignCertificateToEntity(address _entity, string memory _cidentifier, uint _count) public {
        assert(msg.sender == admin);
        entityCertificates[_entity][_cidentifier] = _count;
    }

    function transferCertificateToUser(address _user, string memory _cidentifier, uint _transferCount) public returns (uint) {
        assert(entityCertificates[msg.sender][_cidentifier] > _transferCount);

        entityCertificates[msg.sender][_cidentifier] -= _transferCount;

        userCertificates[_user][_cidentifier] += _transferCount;
        return userCertificates[_user][_cidentifier];
    }
}
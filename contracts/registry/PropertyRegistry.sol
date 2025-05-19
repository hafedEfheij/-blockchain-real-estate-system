// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IPropertyRegistry.sol";

/**
 * @title PropertyRegistry
 * @dev Implementation of the property registry contract
 */
contract PropertyRegistry is IPropertyRegistry, Ownable {
    using Counters for Counters.Counter;
    
    // Counter for property IDs
    Counters.Counter private _propertyIdCounter;
    
    // Mapping from property ID to Property struct
    mapping(uint256 => Property) private _properties;
    
    // Mapping from owner address to array of property IDs
    mapping(address => uint256[]) private _ownerProperties;
    
    // Array of property IDs for sale
    uint256[] private _propertiesForSale;
    
    // Mapping of authorized verifiers
    mapping(address => bool) private _verifiers;
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // Add contract deployer as a verifier
        _verifiers[msg.sender] = true;
    }
    
    /**
     * @dev Modifier to check if the caller is the owner of a property
     */
    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(_properties[_propertyId].owner == msg.sender, "Not the property owner");
        _;
    }
    
    /**
     * @dev Modifier to check if the caller is an authorized verifier
     */
    modifier onlyVerifier() {
        require(_verifiers[msg.sender], "Not an authorized verifier");
        _;
    }
    
    /**
     * @dev Add a verifier
     * @param _verifier Address of the verifier to add
     */
    function addVerifier(address _verifier) external onlyOwner {
        _verifiers[_verifier] = true;
    }
    
    /**
     * @dev Remove a verifier
     * @param _verifier Address of the verifier to remove
     */
    function removeVerifier(address _verifier) external onlyOwner {
        _verifiers[_verifier] = false;
    }
    
    /**
     * @dev Check if an address is a verifier
     * @param _verifier Address to check
     * @return isVerifier Whether the address is a verifier
     */
    function isVerifier(address _verifier) external view returns (bool) {
        return _verifiers[_verifier];
    }
    
    /**
     * @dev Register a new property
     * @param _location Location of the property
     * @param _area Area of the property in square meters
     * @param _propertyType Type of the property (e.g., residential, commercial)
     * @param _documents Array of document URIs related to the property
     * @param _price Initial price of the property
     * @param _forSale Whether the property is for sale
     * @return propertyId The ID of the newly registered property
     */
    function registerProperty(
        string memory _location,
        uint256 _area,
        string memory _propertyType,
        string[] memory _documents,
        uint256 _price,
        bool _forSale
    ) external override returns (uint256) {
        _propertyIdCounter.increment();
        uint256 propertyId = _propertyIdCounter.current();
        
        Property memory newProperty = Property({
            id: propertyId,
            location: _location,
            area: _area,
            propertyType: _propertyType,
            documents: _documents,
            owner: msg.sender,
            price: _price,
            forSale: _forSale,
            verified: false
        });
        
        _properties[propertyId] = newProperty;
        _ownerProperties[msg.sender].push(propertyId);
        
        if (_forSale) {
            _propertiesForSale.push(propertyId);
        }
        
        emit PropertyRegistered(propertyId, msg.sender, _location);
        
        return propertyId;
    }
    
    /**
     * @dev Verify a property (only authorized verifiers)
     * @param _propertyId ID of the property to verify
     */
    function verifyProperty(uint256 _propertyId) external override onlyVerifier {
        require(_propertyId <= _propertyIdCounter.current(), "Property does not exist");
        require(!_properties[_propertyId].verified, "Property already verified");
        
        _properties[_propertyId].verified = true;
        
        emit PropertyVerified(_propertyId, msg.sender);
    }
    
    /**
     * @dev List a property for sale
     * @param _propertyId ID of the property to list
     * @param _price Price of the property
     */
    function listPropertyForSale(uint256 _propertyId, uint256 _price) external override onlyPropertyOwner(_propertyId) {
        require(!_properties[_propertyId].forSale, "Property already for sale");
        
        _properties[_propertyId].forSale = true;
        _properties[_propertyId].price = _price;
        _propertiesForSale.push(_propertyId);
        
        emit PropertyListed(_propertyId, _price);
    }
    
    /**
     * @dev Unlist a property from sale
     * @param _propertyId ID of the property to unlist
     */
    function unlistProperty(uint256 _propertyId) external override onlyPropertyOwner(_propertyId) {
        require(_properties[_propertyId].forSale, "Property not for sale");
        
        _properties[_propertyId].forSale = false;
        
        // Remove from properties for sale array
        for (uint256 i = 0; i < _propertiesForSale.length; i++) {
            if (_propertiesForSale[i] == _propertyId) {
                _propertiesForSale[i] = _propertiesForSale[_propertiesForSale.length - 1];
                _propertiesForSale.pop();
                break;
            }
        }
        
        emit PropertyUnlisted(_propertyId);
    }
    
    /**
     * @dev Transfer property ownership (internal function)
     * @param _propertyId ID of the property
     * @param _newOwner Address of the new owner
     */
    function _transferProperty(uint256 _propertyId, address _newOwner) internal {
        address currentOwner = _properties[_propertyId].owner;
        
        // Remove from current owner's properties
        uint256[] storage ownerProps = _ownerProperties[currentOwner];
        for (uint256 i = 0; i < ownerProps.length; i++) {
            if (ownerProps[i] == _propertyId) {
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
        
        // Add to new owner's properties
        _ownerProperties[_newOwner].push(_propertyId);
        
        // Update property owner
        _properties[_propertyId].owner = _newOwner;
        _properties[_propertyId].forSale = false;
        
        // Remove from properties for sale if it was for sale
        if (_properties[_propertyId].forSale) {
            for (uint256 i = 0; i < _propertiesForSale.length; i++) {
                if (_propertiesForSale[i] == _propertyId) {
                    _propertiesForSale[i] = _propertiesForSale[_propertiesForSale.length - 1];
                    _propertiesForSale.pop();
                    break;
                }
            }
        }
    }
    
    /**
     * @dev Transfer property ownership (only called by PropertyTransactions contract)
     * @param _propertyId ID of the property
     * @param _newOwner Address of the new owner
     */
    function transferProperty(uint256 _propertyId, address _newOwner) external {
        // In a real implementation, we would add access control to ensure only the
        // PropertyTransactions contract can call this function
        _transferProperty(_propertyId, _newOwner);
    }
    
    /**
     * @dev Get property details
     * @param _propertyId ID of the property
     * @return Property details
     */
    function getProperty(uint256 _propertyId) external view override returns (Property memory) {
        require(_propertyId <= _propertyIdCounter.current(), "Property does not exist");
        return _properties[_propertyId];
    }
    
    /**
     * @dev Get all properties owned by an address
     * @param _owner Address of the owner
     * @return Array of property IDs
     */
    function getPropertiesByOwner(address _owner) external view override returns (uint256[] memory) {
        return _ownerProperties[_owner];
    }
    
    /**
     * @dev Get all properties for sale
     * @return Array of property IDs
     */
    function getPropertiesForSale() external view override returns (uint256[] memory) {
        return _propertiesForSale;
    }
}

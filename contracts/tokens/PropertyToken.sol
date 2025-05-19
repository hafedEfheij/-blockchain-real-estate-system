// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interfaces/IPropertyToken.sol";
import "../interfaces/IPropertyRegistry.sol";

/**
 * @title PropertyToken
 * @dev Implementation of property tokenization using ERC721 standard
 */
contract PropertyToken is IPropertyToken, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    // Reference to the PropertyRegistry contract
    IPropertyRegistry private _propertyRegistry;
    
    // Mapping from property ID to token ID
    mapping(uint256 => uint256) private _propertyToToken;
    
    // Mapping from token ID to property ID
    mapping(uint256 => uint256) private _tokenToProperty;
    
    /**
     * @dev Constructor
     * @param propertyRegistryAddress Address of the PropertyRegistry contract
     */
    constructor(address propertyRegistryAddress) ERC721("Real Estate Token", "RET") Ownable(msg.sender) {
        _propertyRegistry = IPropertyRegistry(propertyRegistryAddress);
    }
    
    /**
     * @dev Modifier to check if the caller is the owner of a property
     */
    modifier onlyPropertyOwner(uint256 _propertyId) {
        IPropertyRegistry.Property memory property = _propertyRegistry.getProperty(_propertyId);
        require(property.owner == msg.sender, "Not the property owner");
        _;
    }
    
    /**
     * @dev Tokenize a property
     * @param _propertyId ID of the property to tokenize
     * @param _metadataURI URI for the token metadata
     * @return tokenId The ID of the newly created token
     */
    function tokenizeProperty(uint256 _propertyId, string memory _metadataURI) 
        external 
        override 
        onlyPropertyOwner(_propertyId) 
        returns (uint256) 
    {
        require(!isPropertyTokenized(_propertyId), "Property already tokenized");
        
        // Get property details to verify it exists and is verified
        IPropertyRegistry.Property memory property = _propertyRegistry.getProperty(_propertyId);
        require(property.verified, "Property not verified");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _metadataURI);
        
        _propertyToToken[_propertyId] = tokenId;
        _tokenToProperty[tokenId] = _propertyId;
        
        emit PropertyTokenized(tokenId, _propertyId, msg.sender);
        
        return tokenId;
    }
    
    /**
     * @dev Update token metadata
     * @param _tokenId ID of the token
     * @param _metadataURI New URI for the token metadata
     */
    function updateTokenMetadata(uint256 _tokenId, string memory _metadataURI) external override {
        require(_exists(_tokenId), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the token owner");
        
        _setTokenURI(_tokenId, _metadataURI);
        
        emit PropertyTokenMetadataUpdated(_tokenId, _metadataURI);
    }
    
    /**
     * @dev Override transferFrom to update property ownership
     */
    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) {
        super.transferFrom(from, to, tokenId);
        
        // Update property ownership in the registry
        uint256 propertyId = _tokenToProperty[tokenId];
        
        // In a real implementation, we would need to ensure the PropertyRegistry
        // allows this contract to transfer properties
        // For simplicity, we're assuming it does
        
        // Call the PropertyRegistry to transfer the property
        // This would require the PropertyRegistry to have a function like:
        // function transferProperty(uint256 _propertyId, address _newOwner) external;
        
        emit PropertyTokenTransferred(tokenId, from, to);
    }
    
    /**
     * @dev Override safeTransferFrom to update property ownership
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) 
        public 
        override(ERC721, IERC721) 
    {
        super.safeTransferFrom(from, to, tokenId, data);
        
        // Update property ownership in the registry
        uint256 propertyId = _tokenToProperty[tokenId];
        
        // In a real implementation, we would need to ensure the PropertyRegistry
        // allows this contract to transfer properties
        
        emit PropertyTokenTransferred(tokenId, from, to);
    }
    
    /**
     * @dev Get token details
     * @param _tokenId ID of the token
     * @return propertyId ID of the property
     * @return owner Address of the token owner
     * @return metadataURI URI for the token metadata
     */
    function getTokenDetails(uint256 _tokenId) 
        external 
        view 
        override 
        returns (uint256, address, string memory) 
    {
        require(_exists(_tokenId), "Token does not exist");
        
        uint256 propertyId = _tokenToProperty[_tokenId];
        address owner = ownerOf(_tokenId);
        string memory metadataURI = tokenURI(_tokenId);
        
        return (propertyId, owner, metadataURI);
    }
    
    /**
     * @dev Get token ID for a property
     * @param _propertyId ID of the property
     * @return tokenId ID of the token
     */
    function getTokenIdByProperty(uint256 _propertyId) external view override returns (uint256) {
        require(isPropertyTokenized(_propertyId), "Property not tokenized");
        return _propertyToToken[_propertyId];
    }
    
    /**
     * @dev Check if a property is tokenized
     * @param _propertyId ID of the property
     * @return isTokenized Whether the property is tokenized
     */
    function isPropertyTokenized(uint256 _propertyId) public view override returns (bool) {
        return _propertyToToken[_propertyId] != 0;
    }
}

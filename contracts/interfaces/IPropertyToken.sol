// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPropertyToken
 * @dev Interface for property tokenization
 */
interface IPropertyToken {
    /**
     * @dev Event emitted when a property is tokenized
     */
    event PropertyTokenized(
        uint256 indexed tokenId,
        uint256 indexed propertyId,
        address indexed owner
    );

    /**
     * @dev Event emitted when a property token is transferred
     */
    event PropertyTokenTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    /**
     * @dev Event emitted when a property token metadata is updated
     */
    event PropertyTokenMetadataUpdated(
        uint256 indexed tokenId,
        string metadataURI
    );

    /**
     * @dev Tokenize a property
     * @param _propertyId ID of the property to tokenize
     * @param _metadataURI URI for the token metadata
     * @return tokenId The ID of the newly created token
     */
    function tokenizeProperty(uint256 _propertyId, string memory _metadataURI) external returns (uint256 tokenId);

    /**
     * @dev Update token metadata
     * @param _tokenId ID of the token
     * @param _metadataURI New URI for the token metadata
     */
    function updateTokenMetadata(uint256 _tokenId, string memory _metadataURI) external;

    /**
     * @dev Get token details
     * @param _tokenId ID of the token
     * @return propertyId ID of the property
     * @return owner Address of the token owner
     * @return metadataURI URI for the token metadata
     */
    function getTokenDetails(uint256 _tokenId) external view returns (
        uint256 propertyId,
        address owner,
        string memory metadataURI
    );

    /**
     * @dev Get token ID for a property
     * @param _propertyId ID of the property
     * @return tokenId ID of the token
     */
    function getTokenIdByProperty(uint256 _propertyId) external view returns (uint256 tokenId);

    /**
     * @dev Check if a property is tokenized
     * @param _propertyId ID of the property
     * @return isTokenized Whether the property is tokenized
     */
    function isPropertyTokenized(uint256 _propertyId) external view returns (bool isTokenized);
}

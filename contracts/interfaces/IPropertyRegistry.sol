// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPropertyRegistry
 * @dev Interface for the property registry contract
 */
interface IPropertyRegistry {
    /**
     * @dev Struct to store property details
     */
    struct Property {
        uint256 id;
        string location;
        uint256 area;
        string propertyType;
        string[] documents;
        address owner;
        uint256 price;
        bool forSale;
        bool verified;
    }

    /**
     * @dev Event emitted when a new property is registered
     */
    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string location);

    /**
     * @dev Event emitted when a property is verified
     */
    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);

    /**
     * @dev Event emitted when a property is listed for sale
     */
    event PropertyListed(uint256 indexed propertyId, uint256 price);

    /**
     * @dev Event emitted when a property is unlisted from sale
     */
    event PropertyUnlisted(uint256 indexed propertyId);

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
    ) external returns (uint256 propertyId);

    /**
     * @dev Verify a property (only authorized verifiers)
     * @param _propertyId ID of the property to verify
     */
    function verifyProperty(uint256 _propertyId) external;

    /**
     * @dev List a property for sale
     * @param _propertyId ID of the property to list
     * @param _price Price of the property
     */
    function listPropertyForSale(uint256 _propertyId, uint256 _price) external;

    /**
     * @dev Unlist a property from sale
     * @param _propertyId ID of the property to unlist
     */
    function unlistProperty(uint256 _propertyId) external;

    /**
     * @dev Get property details
     * @param _propertyId ID of the property
     * @return Property details
     */
    function getProperty(uint256 _propertyId) external view returns (Property memory);

    /**
     * @dev Get all properties owned by an address
     * @param _owner Address of the owner
     * @return Array of property IDs
     */
    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory);

    /**
     * @dev Get all properties for sale
     * @return Array of property IDs
     */
    function getPropertiesForSale() external view returns (uint256[] memory);
}

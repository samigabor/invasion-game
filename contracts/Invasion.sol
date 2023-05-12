//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "hardhat/console.sol";
import "./libraries/Base64.sol";

struct CharacterAttributes {
    uint256 characterIndex;
    string name;
    string imageURI;
    uint256 hp;
    uint256 maxHp;
    uint256 attackDamage;
}

struct Invador {
    string name;
    string imageURI;
    uint256 hp;
    uint256 maxHp;
    uint256 attackDamage;
}

contract Invasion is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    CharacterAttributes[] defaultCharacters;
    CharacterAttributes[] defaultWeapons;

    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;
    mapping(address => uint256) public nftWeaponHolders;

    Invador public invador;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event WeaponNFTMinted(address sender, uint256 tokenId, uint256 weaponIndex);
    event AttackComplete(uint256 newInvadorHp, uint256 newPlayerHp);
    event HealComplete(uint256 playerIndex, uint256 playerHp);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory invadorName,
        string memory invadorImageURI,
        uint256 invadorHp,
        uint256 invadorAttackDamage,
        string[] memory weaponNames,
        string[] memory weaponImageURIs,
        uint256[] memory weaponAttackDmg
    ) ERC721("Heroes", "HERO") {
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );
        }

        invador = Invador({
            name: invadorName,
            imageURI: invadorImageURI,
            hp: invadorHp,
            maxHp: invadorHp,
            attackDamage: invadorAttackDamage
        });

        for (uint256 i = 0; i < weaponNames.length; i += 1) {
            defaultWeapons.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: weaponNames[i],
                    imageURI: weaponImageURIs[i],
                    hp: 0,
                    maxHp: 0,
                    attackDamage: weaponAttackDmg[i]
                })
            );

            // CharacterAttributes memory w = defaultWeapons[i];
            // console.log(
            //     "WEAPON_NAME: %s, WEAPON_IMAGE_URI: %s",
            //     w.name,
            //     w.imageURI
            // );
        }

        _tokenIdCounter.increment();
    }

    function checkIfUserHasNFTCharacter()
        external
        view
        returns (CharacterAttributes memory)
    {
        uint256 id = nftHolders[msg.sender];
        if (id > 0) {
            return nftHolderAttributes[id];
        } else {
            CharacterAttributes memory emptyCharacter;
            return emptyCharacter;
        }
    }

    function checkIfUserHasNFTWeapon()
        external
        view
        returns (CharacterAttributes memory)
    {
        uint256 id = nftWeaponHolders[msg.sender];
        if (id > 0) {
            return nftHolderAttributes[id];
        } else {
            CharacterAttributes memory emptyWeapon;
            return emptyWeapon;
        }
    }

    function getDefaultCharacters()
        external
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getDefaultWeapons()
        external
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultWeapons;
    }

    function getInvador() external view returns (Invador memory) {
        return invador;
    }

    /**
     * @notice Mints a NFT based on the provided index which is mapped to one of the default characters
     * @param _characterIndex the characted index
     * @dev multiple NFTs are not supporded and mining another NFT would overwrite the current one
     * @dev _characterIndex is not enforced to be one of the default character indexes
     **/
    function mintCharacterNFT(uint256 _characterIndex) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        nftHolderAttributes[tokenId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        // console.log(
        //     "Minted NFT w/ tokenId %s and characterIndex %s",
        //     tokenId,
        //     _characterIndex
        // );

        nftHolders[msg.sender] = tokenId;

        emit CharacterNFTMinted(msg.sender, tokenId, _characterIndex);
    }

    /**
     * @notice Mints a NFT based on the provided index which is mapped to one of the default weapons
     * @param _weaponIndex the characted index
     * @dev multiple NFTs are not supporded and mining another NFT would overwrite the current one
     * @dev _weaponIndex is not enforced to be one of the default weapon indexes
     **/
    function mintWeaponNFT(uint256 _weaponIndex) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        nftHolderAttributes[tokenId] = CharacterAttributes({
            characterIndex: _weaponIndex,
            name: defaultWeapons[_weaponIndex].name,
            imageURI: defaultWeapons[_weaponIndex].imageURI,
            hp: defaultWeapons[_weaponIndex].hp,
            maxHp: defaultWeapons[_weaponIndex].maxHp,
            attackDamage: defaultWeapons[_weaponIndex].attackDamage
        });

        // console.log(
        //     "Minted NFT w/ tokenId %s and characterIndex %s",
        //     tokenId,
        //     _weaponIndex
        // );

        nftWeaponHolders[msg.sender] = tokenId;

        emit WeaponNFTMinted(msg.sender, tokenId, _weaponIndex);
    }

    function attackInvador() external {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];

        require(player.hp > 0, "Player is dead!");
        require(invador.hp > 0, "Invador was already defeted!");

        if (player.hp > invador.attackDamage) {
            player.hp = player.hp - invador.attackDamage;
        } else {
            player.hp = 0;
        }

        uint256 nftTokenIdOfWeapon = nftWeaponHolders[msg.sender];
        CharacterAttributes storage weapon = nftHolderAttributes[
            nftTokenIdOfWeapon
        ];

        if (invador.hp > player.attackDamage) {
            invador.hp = invador.hp - player.attackDamage - weapon.attackDamage;
        } else {
            invador.hp = 0;
        }

        // console.log(
        //     "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
        //     player.name,
        //     player.hp,
        //     player.attackDamage
        // );
        // console.log(
        //     "Invador %s has %s HP and %s AD",
        //     invador.name,
        //     invador.hp,
        //     invador.attackDamage
        // );

        emit AttackComplete(invador.hp, player.hp);
    }

    /**
     * @notice Calculates the cost of healing based on the difference between the maxHp and hp
     * @notice The sender is required to own an NFT
     * @dev multiple NFTs are not supporded yet
     * @return the cost for healing
     **/
    function healCost() public view returns (uint256) {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        require(nftTokenIdOfPlayer > 0, "Sender does not have an nft minted.");
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        uint256 etherForHpCost = 10**15; // 1000 hp == 0.1 ether
        return (player.maxHp - player.hp) * etherForHpCost;
    }

    /**
     * @notice Allows the contract owner to withdraw all funds from contract
     **/
    function withdraw() external payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @notice Resets the player hp to maxHp
     * @notice The sender is required to own an NFT
     * @dev multiple NFTs are not supporded yet
     **/
    function heal() external payable {
        require(msg.value >= healCost(), "Not enough funds to heal!");
        // console.log("Value sent for healing %s: ", msg.value);

        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];

        uint256 healHp = player.maxHp - player.hp;

        require(healHp > 0, "Player already has the max HP!");

        payable(owner()).transfer(msg.value);

        player.hp = player.maxHp;

        // console.log(
        //     "\nPlayer w/ character %s was healed and has %s HP",
        //     player.name,
        //     player.hp
        // );

        emit HealComplete(player.characterIndex, player.hp);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                charAttributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an NFT that empowers the people of Planet Earth to defend it!", "image": "',
                charAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                strHp,
                ', "max_value":',
                strMaxHp,
                '}, { "trait_type": "Attack Damage", "value": ',
                strAttackDamage,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }
}

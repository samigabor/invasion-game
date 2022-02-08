//SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
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

contract Invasion is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    CharacterAttributes[] defaultCharacters;

    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    Invador public invador;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(uint256 newInvadorHp, uint256 newPlayerHp);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory invadorName,
        string memory invadorImageURI,
        uint256 invadorHp,
        uint256 invadorAttackDamage
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

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        invador = Invador({
            name: invadorName,
            imageURI: invadorImageURI,
            hp: invadorHp,
            maxHp: invadorHp,
            attackDamage: invadorAttackDamage
        });

        console.log(
            "Done initializing invador %s w/ HP %s, img %s",
            invador.name,
            invador.hp,
            invador.imageURI
        );

        _tokenIdCounter.increment();
    }

    function checkIfUserHasNFT()
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

    function getDefaultCharacters()
        external
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getInvador() external view returns (Invador memory) {
        return invador;
    }

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

        console.log(
            "Minted NFT w/ tokenId %s and characterIndex %s",
            tokenId,
            _characterIndex
        );

        nftHolders[msg.sender] = tokenId;

        emit CharacterNFTMinted(msg.sender, tokenId, _characterIndex);
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

        if (invador.hp > player.attackDamage) {
            invador.hp = invador.hp - player.attackDamage;
        } else {
            invador.hp = 0;
        }

        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Invador %s has %s HP and %s AD",
            invador.name,
            invador.hp,
            invador.attackDamage
        );

        emit AttackComplete(invador.hp, player.hp);
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

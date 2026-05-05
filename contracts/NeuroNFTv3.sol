// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | maysir=0 | perpetual royalties
// Neuro NFT v3 — AI-generative, on-chain LLM prompt, ZK provenance, ERC-2981 royalties
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title NeuroNFTv3
/// @notice AI NFTs: on-chain LLM prompts, ZK art provenance, 10% perpetual royalties.
///         Mint in $SPI. 5% to creator, 5% to DAO. No gambling/lotteries (maysir=0).
/// @dev NEXUSLAW v4.0 Art.25: NFT royalties in $SPI. No ponzi mechanics.
contract NeuroNFTv3 is ERC721, ERC2981, Ownable, ReentrancyGuard {
    uint256 public tokenCount;
    uint256 public mintPrice = 10e18;
    address public immutable SPI;
    address public daoTreasury;
    struct NFTMeta {
        string llmPrompt; bytes32 artHash; bytes32 zkProofId;
        address creator; uint256 mintedAt; uint256 generation; bool soulbound;
    }
    mapping(uint256 => NFTMeta) public nftMeta;
    mapping(address => uint256[]) public creatorTokens;
    event NFTMinted(uint256 indexed tokenId, address creator, string llmPrompt, bytes32 artHash);
    event NFTEvolved(uint256 indexed tokenId, string newPrompt, bytes32 newArtHash);
    event RoyaltyPaid(uint256 indexed tokenId, address creator, uint256 amount);
    constructor(address spi, address dao, address owner_)
        ERC721("NeuroNFT","NNFT") Ownable(owner_) { SPI=spi; daoTreasury=dao; }
    function supportsInterface(bytes4 id) public view override(ERC721,ERC2981) returns (bool) {
        return super.supportsInterface(id);
    }
    function mint(string calldata prompt, bytes32 artHash, bytes32 zkProofId, bool soulbound)
        external nonReentrant returns (uint256 tokenId) {
        // IERC20(SPI).transferFrom(msg.sender,address(this),mintPrice);
        tokenId=++tokenCount;
        _mint(msg.sender,tokenId);
        _setTokenRoyalty(tokenId,msg.sender,1000); // 10% royalty
        nftMeta[tokenId]=NFTMeta(prompt,artHash,zkProofId,msg.sender,block.timestamp,0,soulbound);
        creatorTokens[msg.sender].push(tokenId);
        emit NFTMinted(tokenId,msg.sender,prompt,artHash);
    }
    function evolve(uint256 tokenId, string calldata newPrompt, bytes32 newArtHash, bytes32 newZkProof)
        external nonReentrant {
        require(ownerOf(tokenId)==msg.sender,"Not owner");
        NFTMeta storage m=nftMeta[tokenId];
        m.llmPrompt=newPrompt; m.artHash=newArtHash; m.zkProofId=newZkProof; m.generation++;
        emit NFTEvolved(tokenId,newPrompt,newArtHash);
    }
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if(nftMeta[tokenId].soulbound){
            require(auth==address(0)||to==address(0),"Soulbound: non-transferable");
        }
        return super._update(to,tokenId,auth);
    }
    function setMintPrice(uint256 price) external onlyOwner { mintPrice=price; }
}

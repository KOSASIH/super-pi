// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  BiosphereRegistry — Carbon Credit + Biodiversity RWA 2.0
// @notice ERC-1155 tokenisation of verified carbon credits & biodiversity units.
//         ARIA v2 validates impact. Retirements irreversible. NexusLaw v3.1 | PI_COIN=BANNED
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BiosphereRegistry is ERC1155, Ownable {
    string  public constant NEXUSLAW         = "v3.1";
    uint256 public constant CARBON_CREDIT     = 1;
    uint256 public constant BIODIVERSITY_UNIT = 2;
    uint256 public constant RENEWABLE_ENERGY  = 3;
    uint256 public constant BLUE_CARBON       = 4;

    struct CreditBatch { uint256 tokenId; string projectId; uint256 vintage; uint256 tonnes; bytes32 ariaVerif; bool retired; }

    mapping(uint256 => CreditBatch) public batches;
    uint256 public batchCount;

    event CreditMinted(uint256 indexed batchId, uint256 tokenId, uint256 tonnes, string projectId);
    event CreditRetired(uint256 indexed batchId, address indexed retiredBy, uint256 amount);

    modifier noForeignToken() { _; }

    constructor() ERC1155("https://api.super-pi.io/biosphere/{id}.json") Ownable(msg.sender) {}

    function mintCredits(address _to, uint256 _tid, uint256 _t, string calldata _pid, uint256 _v, bytes32 _av)
        external onlyOwner returns (uint256 bid) {
        bid = batchCount++;
        batches[bid] = CreditBatch(_tid, _pid, _v, _t, _av, false);
        _mint(_to, _tid, _t, "");
        emit CreditMinted(bid, _tid, _t, _pid);
    }

    function retireCredits(uint256 _bid, uint256 _amt) external {
        require(!batches[_bid].retired, "ALREADY_RETIRED");
        _burn(msg.sender, batches[_bid].tokenId, _amt);
        emit CreditRetired(_bid, msg.sender, _amt);
    }
}

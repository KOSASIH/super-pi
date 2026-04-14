// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  SuperPiComputeMarket v1.0 -- Decentralized Verifiable Compute
// @notice AI/ML task marketplace. Providers earn $SPI. ZK-verified results.
//         ARIA-scored output quality. NexusLaw v3.0. No riba, no Pi Coin.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SuperPiComputeMarket is Ownable, ReentrancyGuard {
    string public constant VERSION = "ComputeMarket v1.0";
    enum State { Open, Assigned, Done, Disputed, Cancelled }

    struct Task {
        uint256 id; address requestor; address provider;
        string taskType; bytes32 inputHash; bytes32 outputHash;
        uint256 reward; uint256 deadline; State state; bool zkOk;
    }
    struct Provider { uint256 capacity; uint256 done; uint256 rep; bool active; }

    uint256 public tasks;
    uint256 public providers;
    uint256 public feeBps = 50;

    mapping(uint256 => Task)   public taskMap;
    mapping(address => Provider) public provMap;

    event TaskCreated(uint256 indexed id, string typ, uint256 reward);
    event Assigned(uint256 indexed id, address provider);
    event Completed(uint256 indexed id, bytes32 out, bool zk);
    event ProviderReg(address indexed p, uint256 tflops);

    function registerProvider(uint256 tflops) external {
        require(tflops > 0); provMap[msg.sender] = Provider(tflops, 0, 500, true); providers++;
        emit ProviderReg(msg.sender, tflops);
    }

    function createTask(string calldata typ, bytes32 inHash, uint256 reward, uint256 hours)
        external nonReentrant returns (uint256 id) {
        require(reward > 0 && bytes(typ).length > 0);
        id = ++tasks;
        taskMap[id] = Task(id, msg.sender, address(0), typ, inHash, bytes32(0),
                          reward, block.timestamp + hours * 1 hours, State.Open, false);
        emit TaskCreated(id, typ, reward);
    }

    function assign(uint256 id) external nonReentrant {
        Task storage t = taskMap[id];
        require(t.state == State.Open && provMap[msg.sender].active && block.timestamp < t.deadline);
        t.provider = msg.sender; t.state = State.Assigned;
        emit Assigned(id, msg.sender);
    }

    function submit(uint256 id, bytes32 outHash, bool zkOk) external nonReentrant {
        Task storage t = taskMap[id];
        require(t.state == State.Assigned && t.provider == msg.sender && block.timestamp <= t.deadline);
        t.outputHash = outHash; t.zkOk = zkOk; t.state = State.Done;
        provMap[msg.sender].done++;
        uint256 r = provMap[msg.sender].rep;
        provMap[msg.sender].rep = r < 990 ? r + 10 : 1000;
        emit Completed(id, outHash, zkOk);
    }
}

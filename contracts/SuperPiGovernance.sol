// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title SuperPiGovernance — On-Chain DAO for the Super Pi Ecosystem v3.0
/// @notice Full OpenZeppelin Governor with timelock, quorum fraction, and SPI voting token
/// @dev 1-day delay | 7-day period | 4% quorum | 2-day timelock
/// @custom:security-contact security@super-pi.io
contract SuperPiGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // ===== EVENTS =====
    event ProposalCategorized(uint256 indexed proposalId, string category);
    event VetoApplied(uint256 indexed proposalId, address indexed guardian);

    // ===== STATE =====
    address public guardian; // Safety guardian — can veto proposals within timelock
    mapping(uint256 => bool) public vetoedProposals;
    mapping(uint256 => string) public proposalCategories;

    // ===== ERRORS =====
    error ProposalVetoed(uint256 proposalId);
    error NotGuardian();

    constructor(
        IVotes              _token,
        TimelockController  _timelock,
        address             _guardian
    )
        Governor("SuperPiGovernance")
        GovernorSettings(
            1 days,     // voting delay
            7 days,     // voting period
            1_000e18    // proposal threshold: 1,000 SPI
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {
        guardian = _guardian;
    }

    // ===== VETO (Guardian safety mechanism) =====

    /// @notice Guardian can veto a queued proposal before execution (safety override)
    function veto(uint256 proposalId) external {
        if (msg.sender != guardian) revert NotGuardian();
        vetoedProposals[proposalId] = true;
        emit VetoApplied(proposalId, msg.sender);
    }

    /// @notice Categorize a proposal for UI/indexer
    function categorizeProposal(uint256 proposalId, string calldata category)
        external
        onlyGovernance
    {
        proposalCategories[proposalId] = category;
        emit ProposalCategorized(proposalId, category);
    }

    // ===== OVERRIDES =====

    function votingDelay()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.votingDelay(); }

    function votingPeriod()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.votingPeriod(); }

    function quorum(uint256 blockNumber)
        public view override(Governor, GovernorVotesQuorumFraction) returns (uint256)
    { return super.quorum(blockNumber); }

    function proposalThreshold()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.proposalThreshold(); }

    function state(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl) returns (ProposalState)
    {
        if (vetoedProposals[proposalId]) return ProposalState.Canceled;
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl) returns (bool)
    { return super.proposalNeedsQueuing(proposalId); }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        if (vetoedProposals[proposalId]) revert ProposalVetoed(proposalId);
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal view override(Governor, GovernorTimelockControl) returns (address)
    { return super._executor(); }
}

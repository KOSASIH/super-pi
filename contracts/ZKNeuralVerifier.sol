// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — ZKNeuralVerifier
// Groth16/PLONK on-chain verifier for zkML inference proofs
import "@openzeppelin/contracts/access/Ownable.sol";

interface IGroth16 { function verifyProof(uint256[2] calldata,uint256[2][2] calldata,uint256[2] calldata,uint256[] calldata) external view returns(bool); }

contract ZKNeuralVerifier is Ownable {
    IGroth16 public groth16;
    struct Inference { bytes32 modelId; bytes32 inputHash; int256 output; uint256 conf; bool verified; uint256 ts; }
    mapping(bytes32 => Inference) public inferences;
    uint256 public verifiedCount;
    event InferenceVerified(bytes32 indexed key, bytes32 modelId, int256 output, uint256 conf);
    event InferenceRejected(bytes32 indexed key);
    constructor(address _g) Ownable(msg.sender) { groth16=IGroth16(_g); }
    function verifyInference(bytes32 mid,bytes32 ih,int256 out,uint256 conf,uint256[2] calldata a,uint256[2][2] calldata b,uint256[2] calldata c,uint256[] calldata pub) external returns(bool ok) {
        require(conf<=10000,"conf"); bytes32 key=keccak256(abi.encodePacked(mid,ih));
        ok=groth16.verifyProof(a,b,c,pub);
        if(ok){ inferences[key]=Inference(mid,ih,out,conf,true,block.timestamp); verifiedCount++; emit InferenceVerified(key,mid,out,conf); }
        else emit InferenceRejected(key); }
    function isVerified(bytes32 m,bytes32 i) external view returns(bool){ return inferences[keccak256(abi.encodePacked(m,i))].verified; }
}

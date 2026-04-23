pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address public amm;

    constructor() ERC20("AMM LP Token", "ALP") {
        amm = msg.sender;
    }

    modifier onlyAMM() {
        require(msg.sender == amm, "Only AMM can call");
        _;
    }

    function mint(address to, uint256 amount) external onlyAMM {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyAMM {
        _burn(from, amount);
    }
}
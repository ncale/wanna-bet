// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BetFactory} from "./BetFactory.sol";

error Unauthorized();
error Expired();
error InvalidStatus();
error FailedTransfer();
error BET__FailedEthTransfer();
error FundsAlreadyWithdrawn();
error BadInput();
error BET__FeeNotEnough();

contract Bet {
    uint256 private immutable BET_ID;
    address private immutable CREATOR;
    address private immutable PARTICIPANT;
    uint256 private immutable AMOUNT;
    IERC20 private immutable TOKEN;
    string private MESSAGE;
    address private immutable ARBITRATOR;
    uint256 private immutable VALID_UNTIL;
    BetFactory private _betFactory;

    enum Status {
        Pending,
        Declined,
        Accepted,
        Settled
    }
    Status private status = Status.Pending;

    bool private fundsWithdrawn = false;
    address public winner;

    constructor(
        uint256 _betId,
        address _creator,
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _arbitrator,
        uint256 _validFor,
        address _factoryContract
    ) {
        BET_ID = _betId;
        CREATOR = _creator;
        PARTICIPANT = _participant;
        AMOUNT = _amount;
        TOKEN = IERC20(_token);
        MESSAGE = _message;
        ARBITRATOR = _arbitrator;
        VALID_UNTIL = block.timestamp + _validFor;
        _betFactory = BetFactory(_factoryContract);
    }

    event BetAccepted(address indexed factoryContract);
    event BetDeclined(address indexed factoryContract);
    event BetSettled(address indexed factoryContract, address indexed winner);

    modifier onlyCreator() {
        if (msg.sender != CREATOR) revert Unauthorized();
        _;
    }
    modifier onlyParticipant() {
        if (msg.sender != PARTICIPANT) revert Unauthorized();
        _;
    }
    modifier onlyArbitrator() {
        if (msg.sender != ARBITRATOR) revert Unauthorized();
        _;
    }

    function betDetails()
        public
        view
        returns (
            uint256 betId,
            address creator,
            address participant,
            uint256 amount,
            IERC20 token,
            string memory message,
            address arbitrator,
            uint256 validUntil
        )
    {
        return (
            BET_ID,
            CREATOR,
            PARTICIPANT,
            AMOUNT,
            TOKEN,
            MESSAGE,
            ARBITRATOR,
            VALID_UNTIL
        );
    }
    function isExpired() private view returns (bool) {
        return block.timestamp >= VALID_UNTIL && status == Status.Pending;
    }
    function getStatus() public view returns (string memory) {
        if (isExpired()) {
            return "expired";
        } else if (status == Status.Pending) {
            return "pending";
        } else if (status == Status.Declined) {
            return "declined";
        } else if (status == Status.Accepted) {
            return "accepted";
        } else {
            return "settled";
        }
    }

    function acceptBet() public payable onlyParticipant {
        if (msg.value < _betFactory.fee()) revert BET__FeeNotEnough();
        if (isExpired()) revert Expired();
        if (status != Status.Pending) revert InvalidStatus();

        // Transfer tokens to contract
        bool success = TOKEN.transferFrom(msg.sender, address(this), AMOUNT);
        if (!success) revert FailedTransfer();

        // Send fee to factory contract owner
        (bool feeSuccess, ) = payable(_betFactory.owner()).call{
            value: msg.value
        }("");
        if (!feeSuccess) revert BET__FailedEthTransfer();

        // Update state variables
        status = Status.Accepted;
        // Emit event
        emit BetAccepted(address(_betFactory));
    }

    function declineBet() public onlyParticipant {
        if (isExpired()) revert Expired();
        if (status != Status.Pending) revert InvalidStatus();

        // Return tokens to original party
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        if (!success) revert FailedTransfer();

        // Update state variables
        status = Status.Declined;
        // Emit event
        emit BetDeclined(address(_betFactory));
    }

    function retrieveTokens() public onlyCreator {
        if (!isExpired()) revert Unauthorized();
        if (fundsWithdrawn) revert FundsAlreadyWithdrawn();

        // Return tokens to bet creator
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        if (!success) revert FailedTransfer();

        // Update state
        fundsWithdrawn = true;
    }

    function settleBet(address _winner) public onlyArbitrator {
        if (status != Status.Accepted) revert InvalidStatus();
        if (
            _winner != CREATOR &&
            _winner != PARTICIPANT &&
            _winner != 0x0000000000000000000000000000000000000000
        ) revert BadInput();

        // Transfer tokens to winner
        if (_winner == 0x0000000000000000000000000000000000000000) {
            // In tie event, the funds are returned
            bool success1 = TOKEN.transfer(CREATOR, AMOUNT);
            bool success2 = TOKEN.transfer(PARTICIPANT, AMOUNT);
            if (!success1 || !success2) revert FailedTransfer();
        } else {
            // In winning event, all funds are transfered to the winner
            bool success = TOKEN.transfer(_winner, AMOUNT * 2);
            if (!success) revert FailedTransfer();
        }

        // Update state variables
        status = Status.Settled;
        winner = _winner;
        // Emit event
        emit BetSettled(address(_betFactory), _winner);
    }
}

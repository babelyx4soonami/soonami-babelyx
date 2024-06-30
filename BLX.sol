//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

contract BLX is ERC721Enumerable, Ownable {
  using SafeMath for uint256;

  constructor() ERC721('BLX', 'BLX') {
    _name = 'BLX';
    _symbol = 'BLX';
    _contractOwner = payable(msg.sender);
  }

  // override the same names in openzeppelin ERC721, because the original one can't be accessed here.
  string private _name;
  string private _symbol;

  // the original function name() and symbol() still accesses the original names, even if they are overridden in this contract.
  function getName() public view returns (string memory) {
    return _name;
  }

  function getSymbol() public view returns (string memory) {
    return _symbol;
  }

  function setName(string memory name_) public onlyOwner {
    _name = name_;
  }

  function setSymbol(string memory symbol_) public onlyOwner {
    _symbol = symbol_;
  }

  address payable _contractOwner; // 0.5.0以上版本新增了 “payable address” 的概念。

  // 把合约地址里所有ETHER转回给合约主人
  // https://solidity-by-example.org/sending-ether/
  function withdraw() public payable onlyOwner {
    uint balance = address(this).balance;
    require(balance > 0, 'No ether left to withdraw');
    (bool success, ) = (msg.sender).call{ value: balance }(''); // _contractOwner.call
    require(success, 'Transfer failed.');
  }

  uint public _baseMintFee = 0 ether; // The minimum coin account to mint. 如果 defined as public => 自动具有 `function _baseMintFee() view returns (uint)` in ABI, can be called.

  // 本函数让主人可以在后期修改。
  function setBaseMintFee(uint baseMintFee_) public onlyOwner {
    require(baseMintFee_ > 0, "base mint fee can't be zero!");
    _baseMintFee = baseMintFee_;
  }

  function getBaseMintFee() public view returns (uint) {
    return _baseMintFee;
  }

  // The IPFS URL of the folder containing the JSON metadata. 用最直观的 cid 编码:
  // 'f' + '01701220' + 'c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a' 等价于 QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR。
  // 注意 multicodec 要保持一致，如果原来是 dag-pb，就要转换成 01701220，而 server 在 mint 时自动生成的是 raw，所以要转换成 01551220
  string public _baseTokenURI = 'https://ipfs.io/ipfs/f01551220'; // 如果起名叫做 _baseURI, 会和 openzeppelin 里定义的 _baseURI() 函数冲突。

  // 本函数让主人可以在后期修改。
  function setBaseTokenURI(string memory baseURI_) public onlyOwner {
    require(bytes(baseURI_).length > 0, "base URI can't be empty!");
    _baseTokenURI = baseURI_;
  }

  function getBaseTokenURI() public view returns (string memory) {
    return _baseTokenURI;
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId_) public view virtual override returns (string memory) {
    _requireMinted(tokenId_);

    return
      bytes(_baseTokenURI).length > 0
        ? string(
          abi.encodePacked(_baseTokenURI, Strings.toHexString(tokenId_)) // todo 怎样删掉 '0x' ?
        )
        : '';
  }

  // mint tokenId to minterAddress, transfer the mint fee to agentAddress
  function mint(address minterAddress_, uint256 tokenId_, address payable agentAddress_) public payable returns (uint256) {
    // 不应限制 onlyOwner，因为要允许其他 agent 参与。
    require(msg.value >= _baseMintFee, 'Not enough payment to mint.');
    _safeMint(minterAddress_, tokenId_);

    // https://solidity-by-example.org/sending-ether/ 怎样在合约里发送以太币
    // 如果允许了非主人调用，为了避免滥用，要扣除设置最低的费用由合约主人收取。
    if (msg.value > 0) {
      if (_baseMintFee > 0) {
        (bool sent, ) = _contractOwner.call{ value: _baseMintFee }('');
        require(sent, 'Failed to send base fee to contract owner');
      }
      // Transfter the rest fee to agentAddress
      (bool sent, ) = agentAddress_.call{ value: msg.value - _baseMintFee }('');
      require(sent, 'Failed to send Ether');
    }

    return tokenId_;
  }

  function transfer(address from_, address to_, uint256 tokenId_, bytes memory data_) public virtual {
    require(_isApprovedOrOwner(_msgSender(), tokenId_), 'ERC721: caller is not token owner or approved');
    _safeTransfer(from_, to_, tokenId_, data_);
  }

  function tokensOfOwner(address owner_) external view returns (uint[] memory) {
    uint tokenCount = balanceOf(owner_);
    uint[] memory tokenIds = new uint256[](tokenCount);
    for (uint i = 0; i < tokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(owner_, i);
    }

    return tokenIds;
  }
}

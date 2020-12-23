export const MAIN_QUESTIONS = [
  {
    title: 'Why do I first need to pay the service fee?',
    answer: `To facilitate a smooth staking experience, we ask users to promptly pay the service fee.
             This way, we avoid the situation of providing services for an active validator who has
             not paid their service fee.`,
  },
  {
    title: 'Is it secure to deposit with Blox Staking?',
    answer: `First and foremost, Blox is completely non-custodial. We do not retain custody over ANY
             deposited funds; neither the ETH that is deposited in the Eth2 staking deposit contract,
             nor the service fee which is converted into CDT and then burnt. A deposit made through
             Blox is deposited directly to the Ethereum protocol, and never passes through our hands.`,
  },
  {
    title: 'How do I deposit using Ledger/Trezor?',
    answer: `MetaMask allows you to connect a Trezor or Ledger wallet to deposit ETH directly from your
             hardware wallet. For more information on how and why to connect Trezor and Ledger wallets,
             visit MetaMask's guide.`,
  },
  {
    title: 'How does Blox’s service fee work?',
    answer: `The Blox Staking service fee is not "paid" to Blox; rather, it is being exchanged into CDT
             and then burnt as part of our token model. The service fee is paid in advance for 1 year of
             mainnet staking per 1 validator. The service fee is non-refundable.`,
  },
  {
    title: 'Can I get a refund for my validator service fee?',
    answer: `The service fee collected for running and operating your validator is automatically converted
             into CDT and instantly burnt, removing it from circulation. Hence, the service fee is non-refundable.
             Moreover, since Blox is completely non-custodial and we do not hold any deposits,
             there is no central entity that can refund you.`,
  },
  {
    title: 'When will my validator be approved?',
    answer: `Validator approval times vary depending on network participation and the number of validators
             waiting in the queue. Normally, it can take between 4 to 24 hours. For your convenience,
             once your validator has been approved, we will notify you via email.
             You can also check the status of your validator on any Beacon Chain explorer.`,
  }
];

export const TEST_QUESTIONS = [
  {
    title: 'Is it secure to deposit with Blox Staking?',
    answer: `First and foremost, Blox is completely non-custodial. We do not retain custody over ANY
             deposited funds; neither the ETH that is deposited in the Eth2 staking deposit contract,
             nor the service fee which is converted into CDT and then burnt. A deposit made through
             Blox is deposited directly to the Ethereum protocol, and never passes through our hands.`,
  },
  {
    title: 'When will my validator be approved?',
    answer: `Validator approval times vary depending on network participation and the number of validators
             waiting in the queue. Normally, it can take between 4 to 24 hours. For your convenience,
             once your validator has been approved, we will notify you via email.
             You can also check the status of your validator on any Beacon Chain explorer.`,
  }
];
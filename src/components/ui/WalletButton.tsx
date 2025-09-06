"use client";
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletButtonProps {
  className?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({ className = '' }) => {
  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
};

export default WalletButton;
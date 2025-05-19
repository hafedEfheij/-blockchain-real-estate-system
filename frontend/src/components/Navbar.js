import React, { useState, useEffect } from 'react';
import { connectWallet } from '../utils/blockchain';

const Navbar = ({ setWalletInfo }) => {
  const [address, setAddress] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        const { address } = await connectWallet();
        setAddress(address);
        setConnected(true);
        setWalletInfo({ address });
      } catch (error) {
        console.log('No wallet connected');
      }
    };

    checkConnection();
  }, [setWalletInfo]);

  const handleConnect = async () => {
    try {
      const { provider, signer, address } = await connectWallet();
      setAddress(address);
      setConnected(true);
      setWalletInfo({ provider, signer, address });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="/">Blockchain Real Estate</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/properties">Properties</a>
            </li>
            {connected && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/my-properties">My Properties</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/transactions">Transactions</a>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex">
            {connected ? (
              <button className="btn btn-outline-light" disabled>
                {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
              </button>
            ) : (
              <button className="btn btn-outline-light" onClick={handleConnect}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

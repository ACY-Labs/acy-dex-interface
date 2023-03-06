import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { isMobile } from 'react-device-detect';
import { Row, Col, Button } from 'antd';

import {
    injected,
    walletconnect,
    walletlink,
    fortmatic,
    portis,
    torus,
    trezor,
    ledger,
    binance,
    nabox,
} from '@/connectors';

import Login from 'ant-design-pro/lib/Login';
import { Alert, Checkbox, message, Image } from 'antd';
import { DownOutlined, DisconnectOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import QRCode from '@/components/Acy/qrcode.png';

import {
    AcyCard,
    AcyIcon,
    AcyConnectWallet,
    AcyModal,
    AcyCardList,
    AcyRadioButton,
    AcySeting,
} from '@/components/Acy';
import ComponentTabs from '@/components/ComponentTabs';

import { useChainId } from '@/utils/helpers';
import { useWeb3React } from '@web3-react/core';

import styles from './styles.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;


const WalletLogin = props => {

    const { account, activate, deactivate, active } = useWeb3React();
    const { chainId } = useChainId();
    const history = useHistory()

    const [visibleMetaMask, setVisibleMetaMask] = useState(true);
    const [selectedNetwork, setSelectedNetwork] = useState("BSC");
    const [supportedWallets, setSupportWallets] = useState([]);
    const [loginOption, setLoginOption] = useState("Connect Wallet")
    const [broswer, setBroswer] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [state, setState] = useState({
        notice: '',
        type: 'tab2',
        autoLogin: true,
    })

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", (newChainId) => {
                document.location.reload();
            })
        }
    }, [])

    useEffect(() => {
        if (active) {
            history.push('/overview')
        }
    }, [active])

    // const loginOptions = ["Connect Wallet", "Email / Mobile"];
    const loginOptions = ["Connect Wallet"];

    const onhandCancel = () => {
        setVisibleMetaMask(false);
    };
    const onChange = item => {
        setLoginOption(item)
    }

    const selectWallet = walletName => {
        if (walletName != localStorage.getItem("wallet"))
            localStorage.setItem("login_status", "off");
        console.log('selecting wallet', walletName);
        if (walletName === 'metamask') {
            try {
                ethereum;
                activate(injected);
            } catch (error) {
                message.info('No provider was found');
                if (account) {
                    localStorage.setItem("login_status", "on");
                }
                return
            }
        } else if (walletName === 'bitkeep') {
            try {
                ethereum;
                activate(injected);
                if (!window.isBitKeep) {
                    message.info('Wrong wallet, please make sure other wallet extensions has been closed');
                }
            } catch (error) {
                message.info('No provider was found');
                if (account) {
                    localStorage.setItem("login_status", "on");
                }
                return
            }
        }
        else if (walletName === 'opera') {
            activate(injected);
        }
        else if (walletName === 'walletconnect') {
            activate(walletconnect);
        } else if (walletName === 'coinbase') {
            activate(walletlink);
        } else if (walletName === 'fortmatic') {
            activate(fortmatic);
        } else if (walletName === 'portis') {
            activate(portis);
        } else if (walletName === 'torus') {
            activate(torus);
        } else if (walletName === 'trezor') {
            activate(trezor);
        } else if (walletName === 'ledger') {
            activate(ledger);
        } else if (walletName === 'binance') {
            try {
                BinanceChain
                activate(binance);
            } catch (error) {
                message.info('No provider was found');
                if (account) {
                    localStorage.setItem("login_status", "on");
                }
                return
            }
        } else if (walletName === 'nabox') {
            try {
                NaboxWallet;
                activate(nabox);
            } catch (error) {
                message.info('No provider was found');
                if (account) {
                    localStorage.setItem("login_status", "on");
                }
                return
            }
        } else {
            console.log("wallet ERROR");
        }
        localStorage.setItem('wallet', walletName);
        setVisibleMetaMask(false);
    };
    const n_index = chainId => {
        if (chainId == 56 || chainId == 97) {
            return 2
        }
        if (chainId == 137 || chainId == 80001) {
            return 3
        }
        if (chainId == 1) {
            return 4
        }
        if (chainId == undefined) {
            return 0
        }
        return 1
    }
    const walletListAllSupported = [
        {
            name: 'MetaMask',
            icon: 'Metamask',
            onClick: () => {
                selectWallet('metamask');
            },
        },
        {
            name: 'AcyWallet',
            icon: 'AcyWallet',
            onClick: () => {
                selectWallet('acywallet')
            }
        }
        // {
        //     name: 'Nabox Wallet',
        //     icon: 'Nabox',
        //     onClick: () => {
        //         selectWallet('nabox');
        //     },
        // },
        // {
        //     name: 'Bitkeep Wallet',
        //     icon: 'Bitkeep',
        //     onClick: () => {
        //         selectWallet('bitkeep');
        //     },
        // },
        // {
        //     name: 'WalletConnect',
        //     icon: 'WalletConnect',
        //     onClick: () => {
        //         selectWallet('walletconnect');
        //     },
        // },
        // {
        //     name: 'TrustWallet',
        //     icon: 'TrustWallet',
        //     onClick: () => {
        //         selectWallet('walletconnect');
        //     },
        // },

    ]
    const walletList = [
        {
            name: 'Coinbase Wallet',
            icon: 'Coinbase',
            onClick: () => {
                selectWallet('coinbase');
            },
        },
        {
            name: 'Nabox Wallet',
            icon: 'Nabox',
            onClick: () => {
                selectWallet('nabox');
            },
        },
        {
            name: 'Bitkeep Wallet',
            icon: 'Bitkeep',
            onClick: () => {
                selectWallet('bitkeep');
            },
        },
        {
            name: 'WalletConnect',
            icon: 'WalletConnect',
            onClick: () => {
                selectWallet('walletconnect');
            },
        },
        {
            name: 'TrustWallet',
            icon: 'TrustWallet',
            onClick: () => {
                selectWallet('walletconnect');
            },
        },
        // {
        //   name: 'Trezor',
        //   icon: 'Trezor',
        //   onClick: () => {
        //     selectWallet('trezor');
        //   },
        // },
        // {
        //   name: 'Ledger',
        //   icon: 'Ledger',
        //   onClick: () => {
        //     selectWallet('ledger');
        //   },
        // },
        // {
        //   name: 'Fortmatic',
        //   icon: 'Fortmatic',
        //   onClick: () => {
        //     selectWallet('fortmatic');
        //   },
        // },
        {
            name: 'Portis',
            icon: 'Portis',
            onClick: () => {
                selectWallet('portis');
            },
        },
        {
            name: 'Torus',
            icon: 'Torus',
            onClick: () => {
                selectWallet('torus');
            },
        },
        {
            name: 'Opera',
            icon: 'Opera',
            svgicon: true,
            onClick: () => {
                selectWallet('opera');
            },
        },
    ];
    const supportedWalletEth = [
        {
            name: 'Binance Wallet',
            icon: 'Binance',
            onClick: () => {
                selectWallet('binance');
            },
        },
        {
            name: 'Coinbase Wallet',
            icon: 'Coinbase',
            onClick: () => {
                selectWallet('coinbase');
            },
        },
        {
            name: 'Portis',
            icon: 'Portis',
            onClick: () => {
                selectWallet('portis');
            },
        },
        {
            name: 'Torus',
            icon: 'Torus',
            onClick: () => {
                selectWallet('torus');
            },
        },
    ]
    const supportedWalletBsc = [
        {
            name: 'Binance Wallet',
            icon: 'Binance',
            onClick: () => {
                selectWallet('binance');
            },
        },
    ]
    const supportedWalletPolygon = [
        {
            name: 'Torus',
            icon: 'Torus',
            onClick: () => {
                selectWallet('torus');
            },
        },
    ]

    const onSubmit = (err, values) => {
        console.log('value collected ->', {
            ...values,
            autoLogin: state.autoLogin,
        });
        if (values.username == 'admin' && values.password == '888888') {
            console.log("overview is logged in")
            history.push('/overview')
        }
        if (state.type === 'tab1') {
            setState(
                {
                    notice: '',
                },
                () => {
                    
                    if (!err && (values.username !== 'admin' || values.password !== '888888')) {
                        setTimeout(() => {
                            setState({
                                notice: 'The combination of username and password is incorrect!',
                            });
                        }, 500);
                    }
                }
            );
        }
    };
    const onTabChange = key => {
        setState({
            type: key,
        });
    };
    const changeAutoLogin = e => {
        setState({
            autoLogin: e.target.checked,
        });
    };

    const [networkListIndex, setNetworkListIndex] = useState(0);
    const networkList = [
        {
            name: 'NO Network',
            //icon: 'Polygon',
            onClick: async () => {
                setVisibleMetaMask(false);
            },
            onClick_showSupportedWallet: async () => {

            },
        },
        {
            name: 'Wrong Network',
            //icon: 'Polygon',
            onClick: async () => {
                setVisibleMetaMask(false);
            },
            onClick_showSupportedWallet: async () => {

            },
        },
        {
            name: 'BNB Chain',
            icon: 'Binance',
            onClick: async () => {
                await switchEthereumChain("0x38");
                setVisibleMetaMask(false);
            },
            onClick_showSupportedWallet: async () => {
                setSelectedNetwork('BNB Chain');
                setSupportWallets(supportedWalletBsc);
            },
        },
        {
            name: 'Polygon',
            icon: 'Polygon',
            onClick: async () => {
                await switchEthereumChain("0x89");
                setVisibleMetaMask(false);
            },
            onClick_showSupportedWallet: async () => {
                setSelectedNetwork('Polygon');
                setSupportWallets(supportedWalletPolygon);
            },
        },
        {
            name: 'Ethereum',
            icon: 'Eth',
            onClick: async () => {
                await switchEthereumChain("0x1");
                setVisibleMetaMask(false);
            },
            onClick_showSupportedWallet: async () => {
                setSelectedNetwork('Ethereum');
                setSupportWallets(supportedWalletEth);
            },
        },
        // {
        //   name: 'Arbitrum',
        //   icon: 'Arbitrum',
        //   onClick: async () => {
        //     await switchEthereumChain("0xA4B1");
        //     setVisibleMetaMask(false);
        //   },
        // },
    ];

    const onhandMetaMask = () => {
        setVisibleMetaMask(true);
        setNetworkListIndex(n_index(chainId));
    };
    const deactivateTest = () => {
        deactivate();
        localStorage.setItem("login_status", 'off')
    }


    return (
        <div className={styles.main}>
            <div className={styles.rowFlexContainer}>
                <div className={styles.placeCenter}>
                    <Row>
                        <Col span={15}>
                            <Login
                                style={{ backgroundColor: "red" }}
                                defaultActiveKey={state.type}
                                onTabChange={onTabChange}
                                onSubmit={onSubmit}
                            >
                                <ComponentTabs
                                    option={loginOption}
                                    options={loginOptions}
                                    onChange={onChange}
                                />
                                {loginOption == "Connect Wallet" &&
                                    <div styles={{ marginTop: "1rem", borderRight:"0.75px solid #444444"}}>
                                        {!account && <div style={{ padding: "10px" }}>
                                            <div className={styles.networkTitle}>
                                                <span>1. Select a Network</span>
                                            </div>
                                            {/*ymj*/}
                                            <AcyCardList grid={true}>
                                                {networkList.slice(2,).map((item) => {
                                                    return (
                                                        <AcyCardList.Thin className={selectedNetwork == item.name ? styles.networkListLayout_selected : styles.networkListLayout} onClick={() => {
                                                            item.onClick_showSupportedWallet()
                                                        }}>
                                                            {
                                                                <AcyIcon.MyIcon width={20} type={item.icon} />
                                                            }
                                                            <span>{item.name}</span>
                                                            {selectedNetwork == item.name &&
                                                                <span className={styles.networkListLayout_selectedCheck}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#eb5c20" style={{ height: '18px' }} viewBox="0 0 50 50">
                                                                        <path d="M21.05 33.1 35.2 18.95 32.9 16.7 21.05 28.55 15.05 22.55 12.8 24.8ZM24 44Q19.75 44 16.1 42.475Q12.45 40.95 9.75 38.25Q7.05 35.55 5.525 31.9Q4 28.25 4 24Q4 19.8 5.525 16.15Q7.05 12.5 9.75 9.8Q12.45 7.1 16.1 5.55Q19.75 4 24 4Q28.2 4 31.85 5.55Q35.5 7.1 38.2 9.8Q40.9 12.5 42.45 16.15Q44 19.8 44 24Q44 28.25 42.45 31.9Q40.9 35.55 38.2 38.25Q35.5 40.95 31.85 42.475Q28.2 44 24 44ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24ZM24 41Q31.25 41 36.125 36.125Q41 31.25 41 24Q41 16.75 36.125 11.875Q31.25 7 24 7Q16.75 7 11.875 11.875Q7 16.75 7 24Q7 31.25 11.875 36.125Q16.75 41 24 41Z" />
                                                                    </svg>
                                                                    {/* <CheckCircleTwoTone style={{color: '#eb5c20'}} /> */}
                                                                </span>}
                                                        </AcyCardList.Thin>
                                                    );
                                                }
                                                )}
                                            </AcyCardList>
                                            <div className={styles.walltitle}>
                                                <span style={{ marginLeft: '10px' }}>2. Select a Wallet</span>
                                            </div>

                                            <AcyCardList grid={true}>
                                                {broswer === 'Opera' && OperaWallet.map((item, index) => {

                                                    return (
                                                        <AcyCardList.Thin className={styles.walletList} onClick={() => item.onClick()}>
                                                            {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                                                                <AcyIcon.MyIcon width={32} type={item.icon} />
                                                            )}
                                                            <span className={styles.fontBold}>{item.name}</span>
                                                        </AcyCardList.Thin>
                                                    );

                                                })}

                                                {walletListAllSupported.map((item, index) => {

                                                    return (
                                                        <AcyCardList.Thin className={styles.networkListLayout} onClick={() => item.onClick()}>
                                                            {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                                                                item.icon == "AcyWallet" ?
                                                                <AcyIcon width={32} name="acy" style={{marginRight: '5px'}}/> :
                                                                <AcyIcon.MyIcon width={32} type={item.icon} />
                                                            )}
                                                            <span className={styles.fontBold}>{item.name}</span>
                                                        </AcyCardList.Thin>
                                                    );

                                                })}
                                                {supportedWallets.map((item, index) => {

                                                    return (
                                                        <AcyCardList.Thin className={styles.networkListLayout} onClick={() => item.onClick()}>
                                                            {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                                                                <AcyIcon.MyIcon width={32} type={item.icon} />
                                                            )}
                                                            <span className={styles.fontBold}>{item.name}</span>
                                                        </AcyCardList.Thin>
                                                    );

                                                })}
                                            </AcyCardList>
                                            {/* </AcyModal> */}
                                        </div>}
                                        {account && <div>
                                            <AcyModal width={200} height={100} visible={visibleMetaMask} onCancel={onhandCancel}
                                                bodyStyle={{
                                                    padding: '21px',
                                                    background: '#2e3032',
                                                    borderRadius: ' 20px',
                                                }}>
                                                <div type="primary" shape="round" className={styles.disconnectBtn} onClick={deactivateTest}><DisconnectOutlined /> Disconnect</div>
                                            </AcyModal>
                                        </div>}

                                        {/* 错误弹窗*/}
                                        <AcyModal width={420} visible={isModalVisible}>
                                            <p>ERROR: UNSUPPORT NETWORKS</p>
                                            <p>We are not ready for this networks, please change your networks!</p>
                                        </AcyModal>

                                    </div>}
                                {/* </Tab>
                        <Tab key="tab2" tab="Email"> */}
                                {loginOption == "Email / Mobile" &&
                                    <div style={{ marginTop: "4rem" }}>
                                        {state.notice && (
                                            <Alert
                                                style={{ marginBottom: 24 }}
                                                message={state.notice}
                                                type="error"
                                                showIcon
                                                closable
                                            />
                                        )}
                                        <UserName name="username" style={{ width: "90%", height: "4rem", color: "black", marginLeft: "1rem", marginBottom: "1rem" }} />
                                        <Password name="password" style={{ width: "90%", height: "4rem", backgroundColor: "black", marginLeft: "1rem", marginBottom: "1rem" }} />
                                        <div>
                                            <a style={{ float: 'left', marginLeft: "1rem" }} href="">
                                                Forgot password
                                            </a>
                                        </div>
                                        <Submit style={{ backgroundColor: "black", border: "0.75px solid #444444", float: "right", marginRight: "3rem", width: "100px" }}>Login</Submit>
                                        <div>
                                            <a style={{ float: 'left', marginLeft: "1rem" }} href="">
                                                Register
                                            </a>
                                        </div>
                                    </div>}
                                {/* {loginOption == "Mobile" &&
                            <div style={{ marginTop: "1rem" }}> */}
                                {/* <Mobile name="mobile" style={{ width: "90%", height: "4rem", color: "black", float: "right", marginRight:"3rem", marginBottom: "1rem" }} />
                                <Captcha onGetCaptcha={() => console.log('Get captcha!')} name="captcha" style={{ width: "90%", height: "4rem", color: "black", marginLeft: "1rem", marginBottom: "1rem" }} /> */}
                                {/* <img
                                className={styles.imgCenter}
                                    width={200}
                                    src={QRCode}
                                    style={{}}
                                />
                                <span className={styles.wordCenter} style={{ fontWeight: "bold", fontSize:"1.1rem", marginTop:"1rem"}}>Log in with QR code</span>

                                <span className={styles.wordCenter} style={{padding:"1rem"}}>Scan this code with the Base Wallet mobile app to log in instantly.</span>
                                <div>
                                    <a style={{ float: 'left', marginLeft: "1rem" }} href="">
                                        Forgot password
                                    </a>
                                </div>

                                <div>
                                    <a style={{ float: 'left', marginLeft: "1rem" }} href="">
                                        Register
                                    </a>
                                </div>
                            </div>
                        } */}
                            </Login>
                        </Col>
                        <Col offset={0} span={9}>
                            <div style={{marginTop:"3.5rem"}}>
                                <img className={styles.imgCenter}
                                    width={200}
                                    src={QRCode}
                                    style={{}}
                                />
                                <span className={styles.wordCenter} style={{ fontWeight: "bold", fontSize: "1.1rem", marginTop: "1rem" }}>Log in with QR code</span>

                                <span className={styles.wordCenter} style={{ padding: "1rem" }}>Scan this code with the Base Wallet mobile app to log in instantly.</span>
                                <Button className={styles.button}> Download App</Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div >
    )
}

export default WalletLogin
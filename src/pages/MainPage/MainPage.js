import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { message, Typography } from "antd";
import obyte from "obyte";

import { selectActivePool, selectActivePoolLoadingStatus, selectPools, selectPoolsLoadingStatus } from "store/slices/poolsSlice";
import { WalletBalance } from "components/WalletBalance/WalletBalance";
import { GovernanceList } from "components/GovernanceList";
import { SelectPool } from "components/SelectPool/SelectPool";
import { Spin } from "components/Spin/Spin";
import { useQuery } from "hooks/useQuery";
import { changeWallet, selectWallet } from "store/slices/settingsSlice";
import { changeActivePool } from "store/thunks/changeActivePool";
import { useWindowSize } from "hooks/useWindowSize";

import styles from "./MainPage.module.css";

export const MainPage = () => {
  // hooks
  const status = useSelector(selectPoolsLoadingStatus);
  const activePool = useSelector(selectActivePool);
  const activePoolStatus = useSelector(selectActivePoolLoadingStatus);
  const activeWallet = useSelector(selectWallet);
  const pools = useSelector(selectPools);

  const params = useParams();

  const [inited, setInited] = useState(false);

  const query = useQuery();
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const [width] = useWindowSize();

  const moveToNewLine = width < 990;

  useEffect(() => {
    if (status === "loaded") {

      const { pool } = params;
      const wallet = query.get('wallet');

      if (inited) {
        if (activePool?.address && pool !== activePool.address) {
          navigate(`/${activePool.address}`)
        }
      } else {
        if (pool) {
          if (obyte.utils.isValidAddress(pool)) {
            if (pool in pools) {
              dispatch(changeActivePool(pool));
            } else {
              message.error({ content: "Pool not found!", duration: 5 })
            }
          } else {
            message.error({ content: "Pool address is invalid", duration: 5 })
          }
        }

        if (wallet && obyte.utils.isValidAddress(wallet)) {
          dispatch(changeWallet(wallet));
        } else if (wallet) {
          message.error({ content: "Wallet address is invalid" })
        }

        setInited(true);
      }
    }
  }, [activePool, inited, status])

  if (status === "loading") return <div className={styles.dataLoaderWrap}><Spin size="large" /></div>

  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexDirection: moveToNewLine ? "column" : "row", backgroundColor: !moveToNewLine ? "#24292F" : "transparent", borderRadius: 25 }}>
      <SelectPool disabled={activePoolStatus === "loading"} styles={{ width: `${moveToNewLine ? 100 : 90}%` }} />
      <div style={{ width: moveToNewLine ? "100%" : "15%", paddingRight: 15, textAlign: "center" }}>
        <a target="_blank" rel="noopener" href={activePool?.address ? `${process.env.REACT_APP_STATS_LINK}/pool/${activePool.address}` : process.env.REACT_APP_STATS_LINK}>
          View stats
        </a>
      </div>
    </div>

    {activePoolStatus === "loading" && <div className={styles.poolLoaderWrap}><Spin size="large" /></div>}

    {activePoolStatus === "loaded" && <>
      <WalletBalance />

      <div className={styles.changeParamsWrap}>
        <Typography.Title level={2}>Change parameters</Typography.Title>

        <GovernanceList
          paramsInfo={activePool?.paramsInfo}
          activeGovernance={activePool?.governance_aa}
          voteTokenDecimals={activePool?.voteTokenDecimals}
          voteTokenSymbol={activePool?.voteTokenSymbol}
          voteTokenAddress={activePool?.voteTokenAddress}
          freeze_period={activePool?.freeze_period}
          challenging_period={activePool?.challenging_period}
          activeWallet={activeWallet}
          balance={activePool?.balances[activeWallet]}
          governance_state={activePool?.governance_state}
          poolDefParams={activePool?.poolDefParams}
          mid_price_decimals={activePool?.mid_price_decimals}
          x_symbol={activePool?.x_symbol}
          y_symbol={activePool?.y_symbol}
        />
      </div>
    </>}
  </div>
}
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Typography } from "antd";
import obyte from "obyte";

import { selectActivePool, selectActivePoolLoadingStatus, selectPoolsLoadingStatus } from "store/slices/poolsSlice";
import { WalletBalance } from "components/WalletBalance/WalletBalance";
import { GovernanceList } from "components/GovernanceList";
import { SelectPool } from "components/SelectPool/SelectPool";
import { Spin } from "components/Spin/Spin";
import { useQuery } from "hooks/useQuery";
import { changeWallet, selectWallet } from "store/slices/settingsSlice";
import { changeActivePool } from "store/thunks/changeActivePool";

import styles from "./MainPage.module.css";

export const MainPage = () => {
  // hooks
  const status = useSelector(selectPoolsLoadingStatus);
  const activePool = useSelector(selectActivePool);
  const activePoolStatus = useSelector(selectActivePoolLoadingStatus);
  const activeWallet = useSelector(selectWallet);
  const location = useLocation();

  const [inited, setInited] = useState(false);

  const query = useQuery();
  const dispatch = useDispatch();
  let navigate = useNavigate();

  useEffect(() => {
    if (status === "loaded") {
      const pool = location.hash?.slice(1);
      const wallet = query.get('wallet');

      if (inited) {
        if (activePool?.address && pool !== activePool.address) {
          navigate(`/#${activePool.address}`)
        }
      } else {
        if (pool && obyte.utils.isValidAddress(pool)) {
          dispatch(changeActivePool(pool));
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
    <SelectPool disabled={activePoolStatus === "loading"} styles={{ marginBottom: 40 }} />

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
        />
      </div>
    </>}
  </div>
}
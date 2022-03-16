import { Spin, List } from "antd";
import { useEffect, useState } from "react";

import { GovernanceItem } from "components/GovernanceItem/GovernanceItem";
import { paramList } from "paramList";

export const GovernanceList = ({ governance_state, poolDefParams, paramsInfo, activeGovernance, voteTokenDecimals, voteTokenSymbol, voteTokenAddress, freeze_period, challenging_period, activeWallet, balance }) => {
  const [data, setData] = useState([]);

  useEffect(async () => {
    setData([]);
    const data = Object.keys(paramsInfo).map((name) => ({
      name,
      ...paramsInfo[name],
      choice: paramsInfo[name]?.choices?.[activeWallet],
      value: (name in governance_state) ? governance_state[name] : ((name in poolDefParams) ? poolDefParams[name] : paramList[name].initValue)
    }))


    const filetedData = data.filter(({ value, name }) => {
      if ((name === "mid_price" || name === "price_deviation") && (!value || Number(value) === 0)) return false;
      if (name === "pool_leverage") {
        const mid_price = data.find(({ name }) => name === "mid_price").value
        if (Number(mid_price) !== 0) return false
      }
      return true
    });

    setData(filetedData);
  }, [paramsInfo, balance, activeWallet, governance_state]);

  if (data.length === 0) return <div style={{ padding: 30, display: "flex", justifyContent: "center", width: "100%" }}>
    <Spin size="large" />
  </div>

  return <List
    dataSource={data}
    renderItem={params => {
      return <GovernanceItem
        voteTokenDecimals={voteTokenDecimals}
        voteTokenSymbol={voteTokenSymbol}
        voteTokenAddress={voteTokenAddress}
        activeGovernance={activeGovernance}
        freeze_period={freeze_period}
        challenging_period={challenging_period}
        governance_state={governance_state}
        balance={balance}
        activeWallet={activeWallet}
        poolDefParams={poolDefParams}
        {...params}
      />
    }}
    rowKey={(item) => item.name + item.value}
  />
}
import { createAsyncThunk } from "@reduxjs/toolkit";

import client from "services/obyte";
import { addRecentPool } from "store/slices/settingsSlice";
import { parseGovernanceStateVars } from "utils/parseGovernanceStateVars";



export const changeActivePool = createAsyncThunk(
  'changeActivePool',
  async (address, { getState, dispatch }) => {
    const store = getState();

    const knownData = store.pools.pools?.[address];

    const poolState = await client.api.getAaStateVars({ address });

    const { governance_aa } = poolState;

    const governanceStateVars = await client.api.getAaStateVars({ address: governance_aa });

    dispatch(addRecentPool(address));

    await client.justsaying("light/new_aa_to_watch", {
      aa: governance_aa
    });

    let governanceState = {};

    let challenging_period;
    let freeze_period;

    let balances = {};
    let paramsInfo;

    let voteTokenAddress = poolState?.lp_shares?.asset;
    let voteTokenDecimals = 0;
    let voteTokenSymbol = voteTokenAddress;

    const pool_aa = await client.api.getDefinition(address);

    const poolDefParams = pool_aa[1]?.params || {}

    if (voteTokenAddress) {
      const tokenRegistryAddress = client.api.getOfficialTokenRegistryAddress();

      try {
        voteTokenSymbol = await client.api.getSymbolByAsset(tokenRegistryAddress, voteTokenAddress);
        voteTokenDecimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistryAddress, voteTokenAddress);
      } catch { }
    } else {
      // error
      return null;
    }
    
    try {
      governanceState = (await client.api.getAaStateVars({
        address: governance_aa,
      }));
      let lastKey = "";
      while (true) {
        const chunkData = (await client.api.getAaStateVars({
          address: governance_aa,
          var_prefix_from: lastKey
        }));
        const keys = Object.keys(chunkData);
        if (keys.length > 1) {
          governanceState = { ...governanceState, ...chunkData };
          lastKey = keys[keys.length - 1];
        } else {
          break;
        }
      }
    } catch (e) {
      console.log("Error: ", e);
    }

    const data = parseGovernanceStateVars(governanceState)

    balances = data.balances;
    paramsInfo = data.paramsInfo;

    const def_governance = await client.api.getDefinition(governance_aa);
    const def_governance_params = def_governance[1].params;

    challenging_period = def_governance_params?.challenging_period || 3 * 24 * 60 * 60;
    freeze_period = def_governance_params?.freeze_period || 30 * 24 * 60 * 60;

    return {
      address,
      governance_state: governanceStateVars,
      pool_asset: knownData.pool_asset,
      governance_aa,
      balances,
      paramsInfo,
      poolDefParams,
      voteTokenAddress,
      voteTokenSymbol,
      voteTokenDecimals,
      defParams: def_governance_params,
      challenging_period,
      freeze_period,
    };
  })
import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "services/obyte"



export const loadPools = createAsyncThunk(
  'get/loadPools',
  async () => {
    // load pools
    const stateVars = await client.api.getAaStateVars({ address: process.env.REACT_APP_FACTORY_AA });

    // get token registry AA
    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();

    // prepare data and load symbols
    const pools = {};
    const getSymbols = [];
    const getSwapFee = [];

    Object.keys(stateVars).forEach(name => {
      const address = name.split("_")[1];
      const params = stateVars[name];
      pools[address] = Object.assign({}, params);

      getSymbols.push(
        client.api.getSymbolByAsset(tokenRegistry, params.x_asset).then((x_symbol) => pools[address].x_symbol = x_symbol),
        client.api.getSymbolByAsset(tokenRegistry, params.y_asset).then((y_symbol) => pools[address].y_symbol = y_symbol),
      );

      getSwapFee.push(
        client.api.executeGetter({ address, getter: "get_swap_fee" }).then(({ result }) => pools[address].swap_fee = result),
      )
    })

    await Promise.all(getSymbols);
    await Promise.all(getSwapFee);

    return pools;
  })
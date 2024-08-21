import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import http from "services/http";
import client from "services/obyte"

import { botCheck } from "utils/botCheck";


export const loadPools = createAsyncThunk(
  'get/loadPools',
  async () => {
    // load pools
    const isBot = botCheck();

    let stateVars = {};

    if (isBot) {
      stateVars = await http.getStateVars(process.env.REACT_APP_FACTORY_AA);
    } else {
      stateVars = await client.api.getAaStateVars({ address: process.env.REACT_APP_FACTORY_AA });
    }

    // get token registry AA
    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();

    // prepare data and load symbols
    const pools = {};
    const getSymbols = [];
    const getSwapFee = [];
    const getTvl = [];
    const hours = Math.floor(Date.now() / 1000 / 3600); // hour number since unix epoch

    Object.keys(stateVars).forEach(name => {
      const address = name.split("_")[1];
      const params = stateVars[name];

      pools[address] = Object.assign({}, params);

      if (process.env.REACT_APP_AA_STATS_LINK) {
        getTvl.push(
          axios.post(`${process.env.REACT_APP_AA_STATS_LINK}/address/tvl`, {
            address: address,
            from: hours,
            to: hours
          }).then(({ data = [] }) => {
            pools[address].tvl = data.reduce((acc, item) => acc + item.usd_balance, 0);
          }).catch(() => {
            console.log('log: error in getting tvl', address);
            pools[address].tvl = 0;
          })
        )
      } else {
        console.log("We ignore sort because we don't have AA_STATS_LINK env variable");
      }

      if (isBot) {
        getSymbols.push(
          http.getSymbolByAsset(tokenRegistry, params.x_asset).then((x_symbol) => pools[address].x_symbol = x_symbol),
          http.getSymbolByAsset(tokenRegistry, params.y_asset).then((y_symbol) => pools[address].y_symbol = y_symbol),
        )

        getSwapFee.push(
          http.executeGetter(address, "get_swap_fee").then(({ result }) => pools[address].swap_fee = result),
        )
      } else {
        getSymbols.push(
          client.api.getSymbolByAsset(tokenRegistry, params.x_asset).then((x_symbol) => pools[address].x_symbol = x_symbol),
          client.api.getSymbolByAsset(tokenRegistry, params.y_asset).then((y_symbol) => pools[address].y_symbol = y_symbol),
        );

        getSwapFee.push(
          client.api.executeGetter({ address, getter: "get_swap_fee" }).then(({ result }) => pools[address].swap_fee = result),
        )
      }
    })

    await Promise.all([...getSymbols, ...getSwapFee, ...getTvl]);

    return pools;
  });

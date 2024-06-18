import { RightOutlined } from "@ant-design/icons";
import { List } from "antd";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { paramList } from "paramList";
import { selectPools } from "store/slices/poolsSlice";

import styles from "./PoolsList.module.css";

export const PoolsList = () => {
    const pools = useSelector(selectPools);

    return <List
        className={styles.list}
        dataSource={Object.entries(pools)}
        renderItem={([address, pool]) => <PoolItem address={address} {...pool} />}
    />
}


const PoolItem = ({ address, x_symbol, y_symbol, swap_fee }) => (
    <Link to={`/${address}`} className={styles.poolItem}>
        <div className={styles.poolName}>
            <div className={styles.title}>Pool name</div>
            <div className={styles.value}>{x_symbol} - {y_symbol}</div>
        </div>

        <div className={styles.swapFee}>
            <div className={styles.title}>Swap fee</div>
            <div className={styles.value}>{+Number((swap_fee || paramList.swap_fee.initValue) * 100).toFixed(4)}%</div>
        </div>

        <div className={styles.action}>
            Govern <RightOutlined />
        </div>
    </Link>
)

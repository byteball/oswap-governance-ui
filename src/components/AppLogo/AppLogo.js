import styles from "./AppLogo.module.css";

export const AppLogo = () => {
  return <div className={styles.logoWrap}>
    <a href={process.env.REACT_APP_MAIN_APP_URL}>
      <img src="/logo.svg" className={styles.logo} alt="Oswap" />
    </a>
  </div>
}
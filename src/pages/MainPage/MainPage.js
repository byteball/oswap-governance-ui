import { Helmet } from "react-helmet-async";

import { PoolsList } from "components/PoolsList/PoolsList";
import { PageLayout } from "components/PageLayout/PageLayout";

export const MainPage = () => (<PageLayout>
  <Helmet>
    <title>Oswap.io governance</title>
    <meta property="og:title" content="Oswap.io governance" data-rh="true" />
  </Helmet>

  <h1 style={{ textAlign: "center" }}>Oswap governance</h1>

  <PoolsList />
</PageLayout>)
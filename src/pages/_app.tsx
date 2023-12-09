import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs'
import '@radix-ui/themes/styles.css';
import { api } from "~/utils/api";

import "~/styles/globals.css";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from "react";
import { Theme } from "@radix-ui/themes";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const MyApp: AppType = ({ Component, pageProps }: any) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Hydrate state={pageProps.dehydratedState}>
          <Theme appearance="dark">
            <Component {...pageProps} />
          </Theme>
        </Hydrate>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);

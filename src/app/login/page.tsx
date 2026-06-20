import { Suspense } from "react";

import { LoginClient } from "./login-client";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ configuration_error?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <LoginPageInner searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageInner({
  searchParams,
}: {
  searchParams: Promise<{ configuration_error?: string }>;
}) {
  const params = await searchParams;
  const configurationError = params.configuration_error === "clerk_env";
  return <LoginClient configurationError={configurationError} />;
}

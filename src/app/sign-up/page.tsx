import { Suspense } from "react";

import { SignUpClient } from "./sign-up-client";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ configuration_error?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUpPageInner({
  searchParams,
}: {
  searchParams: Promise<{ configuration_error?: string }>;
}) {
  const params = await searchParams;
  const configurationError = params.configuration_error === "clerk_env";
  return <SignUpClient configurationError={configurationError} />;
}

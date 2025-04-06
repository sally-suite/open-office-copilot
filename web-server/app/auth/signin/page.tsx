"use client";

import SignInDialog from "@/components/SignInDialog";
import { Suspense } from 'react'

export default function Component() {
  // const route = useRouter();

  // const { data: session, status } = useSession();

  // const loading = status == "loading";

  // useEffect(() => {
  //   if (session && callbackUrl) {
  //     // window.location.href = callbackUrl;
  //     route.push(callbackUrl);
  //   }
  // }, [session, callbackUrl]);

  // useEffect(() => {
  //   if (session && !callbackUrl) {
  //     route.push("/");
  //   }
  // }, [session, callbackUrl]);

  // if (loading) {
  //   return null;
  // }
  // const log = () => {

  // };
  // useEffect(() => {
  //   loadCsrfToken();
  // }, []);

  // if (session) {
  //   return null;
  // }

  // const csrfToken = await getCsrfToken();

  return (
    <Suspense>
      <SignInDialog closeable={false} open={true} showEmail={false} />
    </Suspense>
  );
}

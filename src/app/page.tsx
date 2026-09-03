import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import LandingIntro from "@/app/LandingIntro";

export default async function Home() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    redirect("/dashboard");
  }

  return <LandingIntro />;
}

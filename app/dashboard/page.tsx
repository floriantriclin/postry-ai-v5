
import { redirect } from "next/navigation";
import PostRevealView from "./post-reveal-view";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !post) {
    // Handle error or no post found
    // You could redirect to a different page or show a message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Aucun post généré</h1>
        <a href="/quiz" className="mt-4 text-blue-500">Retourner au quiz</a>
      </div>
    );
  }

  return (
      <div>
        <pre>Session: {JSON.stringify(session, null, 2)}</pre>
        <pre>Post: {JSON.stringify(post, null, 2)}</pre>
        <PostRevealView post={post} />
      </div>
    );
}


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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "revealed")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    // Database error - distinct from no posts found
    console.error("Dashboard: Database error", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Erreur de chargement</h1>
        <p className="mt-2 text-gray-600">Une erreur est survenue lors du chargement de vos posts.</p>
        <a href="/quiz" className="mt-4 text-blue-500">Retourner au quiz</a>
      </div>
    );
  }

  const post = posts && posts.length > 0 ? posts[0] : null;

  if (!post) {
    // No posts found - distinct from database error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Aucun post généré</h1>
        <a href="/quiz" className="mt-4 text-blue-500">Retourner au quiz</a>
      </div>
    );
  }

  return (
      <div>
        <PostRevealView post={post} />
      </div>
    );
}

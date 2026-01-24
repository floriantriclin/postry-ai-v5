
import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const authFile = "e2e/.auth/user.json";
const testUser = {
  email: "test@example.com",
  password: "password",
};

setup("authenticate", async ({ page }) => {
  // Check if the user session already exists
  try {
    const session = require(`../${authFile}`);
    if (session) {
      console.log("User session found, skipping authentication.");
      return;
    }
  } catch (error) {
    // Session file doesn't exist, proceed with authentication
  }
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error: getUsersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (getUsersError) {
    console.error("Error listing users:", getUsersError);
    throw new Error("Could not list users");
  }

  const existingUser = users.users.find(
      (user) => user.email === testUser.email
    );
  
    if (existingUser) {
      const { error: updateUserError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: testUser.password,
          email_confirm: true,
        });
    if (updateUserError) {
      console.error("Error updating user:", updateUserError);
      throw new Error("Could not update user");
    }
  } else {
    const { error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
      });
    if (createUserError) {
      console.error("Error creating user:", createUserError);
      throw new Error("Could not create user");
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error: signInError } = await supabase.auth.signInWithPassword(
    testUser
  );

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw new Error("Could not sign in");
  }

  await page.context().storageState({ path: authFile });
  
    await page.goto("/dashboard");
    await page.screenshot({ path: "e2e/dashboard-after-auth.png" });
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      throw new Error("Could not get user");
    }
  
    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      theme: "Test Theme",
      content: "Test Content",
    });
  
    if (postError) {
      console.error("Error creating post:", postError);
      throw new Error("Could not create post");
    }
});

/// <reference types="vitest/globals" />
import { POST } from "./route";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Mock env to prevent crash during import of supabase-admin
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "http://localhost",
    SUPABASE_SERVICE_ROLE_KEY: "mock-key",
  },
}));

// Mock the module and all its exports
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe("API /api/quiz/pre-persist", () => {
  const validPayload = {
    email: "test@example.com",
    stylistic_vector: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    profile: { label: "Test" },
    archetype: { name: "Arch" },
    theme: "Tech",
    post_content: "Test content",
    quiz_answers: [],
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.resetAllMocks();
  });

  it("should return 400 for invalid payload", async () => {
    const req = new NextRequest("http://localhost/api/quiz/pre-persist", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should insert a new post if none is pending", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: mockInsert,
    } as any);

    const req = new NextRequest("http://localhost/api/quiz/pre-persist", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it("should update an existing pending post", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });

    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "post_123" }, error: null }),
      update: mockUpdate,
    } as any);

    const req = new NextRequest("http://localhost/api/quiz/pre-persist", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith("id", "post_123");
  });
});

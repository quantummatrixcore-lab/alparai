import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUserByAdmin } from "@/actions/admin-users";
import { createServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => {
  const adminAuthMock = {
    createUser: vi.fn(),
  };
  const updateMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null })
  });
  return {
    createClient: vi.fn(() => ({
      auth: { admin: adminAuthMock },
      from: vi.fn(() => ({ update: updateMock }))
    }))
  };
});

// Since top-level await is not supported, we can just use the mock from the module
import { createClient } from "@supabase/supabase-js";

describe("createUserByAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if unauthorized", async () => {
    (createServerClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const result = await createUserByAdmin({ email: "test@test.com", fullName: "Test", role: "user" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should fail if user is not admin", async () => {
    (createServerClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u-1" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "user" } })
          })
        })
      })
    });

    const result = await createUserByAdmin({ email: "test@test.com", fullName: "Test", role: "user" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden: Admins only");
  });

  it("should create user successfully if caller is admin", async () => {
    (createServerClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u-admin" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "admin" } })
          })
        })
      })
    });
    
    // We get the mocked client instance
    const mockedClient = createClient("url", "key");
    (mockedClient.auth.admin.createUser as any).mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null
    });

    const result = await createUserByAdmin({ email: "new@test.com", fullName: "New User", role: "moderator" });
    expect(result.ok).toBe(true);
    expect(result.userId).toBe("new-user-id");
  });
});

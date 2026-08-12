"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireCEO } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function toggleTodoAction(
  id: string,
  is_completed: boolean,
): Promise<{ success: boolean }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("strategy_todos")
    .update({ is_completed, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true };
}

export async function deleteTodoAction(id: string): Promise<{ success: boolean }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { error } = await supabase.from("strategy_todos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true };
}

export async function createTodoAction(
  title: string,
  priority: number,
): Promise<{ success: boolean; id: string }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { data: inserted, error } = await supabase
    .from("strategy_todos")
    .insert({
      title,
      priority,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: inserted.id };
}

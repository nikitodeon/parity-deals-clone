import { db } from "@/db/index";
import { ProductTable, UserSubscriptionTable } from "@/db/schema";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";
import { eq } from "drizzle-orm";

export async function deleteUser(clerkUserId: string) {
  return await db.transaction(async (trx) => {
    // Получаем записи, которые будем удалять
    const userSubscriptions = await trx
      .select({
        id: UserSubscriptionTable.id,
      })
      .from(UserSubscriptionTable)
      .where(eq(UserSubscriptionTable.clerkUserId, clerkUserId));

    const products = await trx
      .select({
        id: ProductTable.id,
      })
      .from(ProductTable)
      .where(eq(ProductTable.clerkUserId, clerkUserId));

    // Удаляем записи
    await trx
      .delete(UserSubscriptionTable)
      .where(eq(UserSubscriptionTable.clerkUserId, clerkUserId));

    await trx
      .delete(ProductTable)
      .where(eq(ProductTable.clerkUserId, clerkUserId));

    // Обновляем кэш
    userSubscriptions.forEach((sub: { id: string }) => {
      revalidateDbCache({
        tag: CACHE_TAGS.subscription,
        id: sub.id,
        userId: clerkUserId,
      });
    });

    products.forEach((prod: { id: string }) => {
      revalidateDbCache({
        tag: CACHE_TAGS.products,
        id: prod.id,
        userId: clerkUserId,
      });
    });

    return [userSubscriptions, products];
  });
}

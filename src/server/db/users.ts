import { db } from "@/db/index";
import { ProductTable, UserSubscriptionTable } from "@/db/schema";
// import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache"
import { eq } from "drizzle-orm";

export async function deleteUser(clerkUserId: string) {
  //   const [userSubscriptions, products] = await
  return await db.transaction(async (trx) => {
    await trx
      .delete(UserSubscriptionTable)
      .where(eq(UserSubscriptionTable.clerkUserId, clerkUserId));
    //   .returning({
    //     id: UserSubscriptionTable.id,
    //   }),
    await trx
      .delete(ProductTable)
      .where(eq(ProductTable.clerkUserId, clerkUserId));
    //   .returning({
    //     id: ProductTable.id,
    //   }),
  });

  //   userSubscriptions.forEach(sub => {
  //     revalidateDbCache({
  //       tag: CACHE_TAGS.subscription,
  //       id: sub.id,
  //       userId: clerkUserId,
  //     })
  //   })

  //   products.forEach(prod => {
  //     revalidateDbCache({
  //       tag: CACHE_TAGS.products,
  //       id: prod.id,
  //       userId: clerkUserId,
  //     })
  //   })

  //   return [userSubscriptions, products]
}

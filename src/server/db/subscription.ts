import { subscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/db/index";
import { UserSubscriptionTable } from "@/db/schema";
import {
  CACHE_TAGS,
  dbCache,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { SQL } from "drizzle-orm";

export async function createUserSubscription(
  data: typeof UserSubscriptionTable.$inferInsert
) {
  const [newSubscription] = await db
    .insert(UserSubscriptionTable)
    .values(data)
    .onConflictDoNothing({
      target: UserSubscriptionTable.clerkUserId,
    })
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    });

  if (newSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      id: newSubscription.id,
      userId: newSubscription.userId,
    });
  }

  return newSubscription;
}

export function getUserSubscription(userId: string) {
  ////////
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.subscription)],
  });

  return cacheFn(userId);
  ////////////
  // return getUserSubscriptionInternal(userId);
}
////////////////
// export function getUserSubscription(userId: string) {
//   const cacheFn = dbCache(getUserSubscriptionInternal, {
//     tags: [getUserTag(userId, CACHE_TAGS.subscription)],
//   });

//   const subscription = cacheFn(userId);
//   console.log("Cache Subscription Data:", subscription); // Лог данных из кэша
//   return subscription;
// }

export async function updateUserSubscription(
  where: SQL,
  data: Partial<typeof UserSubscriptionTable.$inferInsert>
) {
  const [updatedSubscription] = await db
    .update(UserSubscriptionTable)
    .set(data)
    .where(where)
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    });

  if (updatedSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      userId: updatedSubscription.userId,
      id: updatedSubscription.id,
    });
  }
}

export async function getUserSubscriptionTier(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (subscription == null)
    //  return subscriptionTiers["Free"];
    throw new Error("User has no subscription");

  return subscriptionTiers[subscription.tier];
}

function getUserSubscriptionInternal(userId: string) {
  return db.query.UserSubscriptionTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  });
}
///////////
// function getUserSubscriptionInternal(userId: string) {
//   const result = db.query.UserSubscriptionTable.findFirst({
//     where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
//   });

//   console.log("DB Query Result:", result); // Лог результата из базы
//   return result;
// }

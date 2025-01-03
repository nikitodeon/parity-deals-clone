import { Banner } from "@/components/Banner";
import { env } from "@/data/env/server";
import { getProductForBanner } from "@/server/db/products";
import { createProductView } from "@/server/db/productViews";
import { canRemoveBranding, canShowDiscountBanner } from "@/server/permissions";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { createElement } from "react";

export const runtime = "edge";
/////////////
interface CustomNextRequest extends NextRequest {
  geo?: { country?: string };
}
///////////
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = await params;
  ////////////
  console.log("Received productId:", productId);
  //////////
  const headersMap = await headers();
  const requestingUrl = headersMap.get("referer") || headersMap.get("origin");
  if (requestingUrl == null) return notFound();
  const countryCode = getCountryCode(request);
  ///////////////
  console.log("getCountryCode result:", countryCode);
  /////////////
  if (countryCode == null) return notFound();
  //////////
  console.log("Hi");
  ///////////
  ////////////////
  console.log("params:", params);
  console.log("productId:", productId);
  //////////////
  console.log("Calling getProductForBanner with params:", {
    id: productId,
    countryCode,
    url: requestingUrl,
  });
  ////////////
  /////////////
  const { product, discount, country } = await getProductForBanner({
    id: productId,
    countryCode,
    url: requestingUrl,
  });
  //////////////////
  console.log("getProductForBanner output:", { product, discount, country });
  ///////////////
  if (product == null) return notFound();

  const canShowBanner = await canShowDiscountBanner(product.clerkUserId);
  //////////////////
  console.log("canShowDiscountBanner result:", canShowBanner);
  ///////////////
  await createProductView({
    productId: product.id,
    countryId: country?.id,
    userId: product.clerkUserId,
  });
  ////////////
  console.log(canShowBanner);
  console.log(country, discount);
  //////////////
  if (!canShowBanner) return notFound();
  if (country == null || discount == null) return notFound();

  return new Response(
    await getJavaScript(
      product,
      country,
      discount,
      await canRemoveBranding(product.clerkUserId)
    ),
    { headers: { "content-type": "text/javascript" } }
  );
}

function getCountryCode(request: CustomNextRequest) {
  if (request.geo?.country != null) return request.geo.country;
  if (process.env.NODE_ENV === "development") {
    return env.TEST_COUNTRY_CODE;
  }
}

async function getJavaScript(
  product: {
    customization: {
      locationMessage: string;
      bannerContainer: string;
      backgroundColor: string;
      textColor: string;
      fontSize: string;
      isSticky: boolean;
      classPrefix?: string | null;
    };
  },
  country: { name: string },
  discount: { coupon: string; percentage: number },
  canRemoveBranding: boolean
) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return `
    const banner = document.createElement("div");
    banner.innerHTML = '${renderToStaticMarkup(
      createElement(Banner, {
        message: product.customization.locationMessage,
        mappings: {
          country: country.name,
          coupon: discount.coupon,
          discount: (discount.percentage * 100).toString(),
        },
        customization: product.customization,
        canRemoveBranding,
      })
    )}';
    document.querySelector("${
      product.customization.bannerContainer
    }").prepend(...banner.children);
  `.replace(/(\r\n|\n|\r)/g, "");
}

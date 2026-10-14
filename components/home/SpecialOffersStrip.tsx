import PromoBanner from "./PromoBanner";

/** `home.special-offers` placement, rendered as a 2-up responsive grid. */
export default function SpecialOffersStrip() {
  return (
    <PromoBanner
      placement="home.special-offers"
      aspectClassName="aspect-[16/9]"
    />
  );
}

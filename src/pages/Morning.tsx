import { Sun } from "lucide-react";
import { AzkarPage } from "@/components/AzkarPage";
import { SEO } from "@/components/SEO";

const Morning = () => (
  <>
    <SEO />
    <AzkarPage
      category="morning"
      title="أذكار الصباح"
      subtitle="احفظ يومك بذكر الله من الفجر إلى طلوع الشمس"
      Icon={Sun}
      gradient="from-amber-600 via-orange-600 to-rose-600"
    />
  </>
);
export default Morning;

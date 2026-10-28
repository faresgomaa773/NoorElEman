import { Sun } from "lucide-react";
import { AzkarPage } from "@/components/AzkarPage";
import { SEO } from "@/components/SEO";

const Morning = () => (
  <>
    <SEO
      title="أذكار الصباح | نور الإيمان"
      description="أذكار الصباح المباركة من القرآن والسنة، احفظ يومك بذكر الله من الفجر إلى طلوع الشمس."
      keywords="أذكار الصباح, اذكار الصباح, دعاء الصباح, حصن المسلم, نور الإيمان"
    />
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

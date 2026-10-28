import { Moon } from "lucide-react";
import { AzkarPage } from "@/components/AzkarPage";
import { SEO } from "@/components/SEO";

const Evening = () => (
  <>
    <SEO
      title="أذكار المساء | نور الإيمان"
      description="أذكار المساء المباركة من القرآن والسنة، اختم يومك بذكر الله من العصر إلى المغرب."
      keywords="أذكار المساء, اذكار المساء, دعاء المساء, حصن المسلم, نور الإيمان"
    />
    <AzkarPage
      category="evening"
      title="أذكار المساء"
      subtitle="اختم يومك بذكر الله من العصر إلى المغرب"
      Icon={Moon}
      gradient="from-indigo-700 via-purple-700 to-violet-800"
    />
  </>
);
export default Evening;

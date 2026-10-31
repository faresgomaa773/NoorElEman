import { Moon } from "lucide-react";
import { AzkarPage } from "@/components/AzkarPage";
import { SEO } from "@/components/SEO";

const Evening = () => (
  <>
    <SEO />
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

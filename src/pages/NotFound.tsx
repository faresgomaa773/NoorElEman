import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEO title="الصفحة غير موجودة | نور الإيمان" description="هذه الصفحة غير موجودة، يمكنك العودة إلى نور الإيمان." />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">الصفحة غير موجودة</p>
        <Button asChild variant="link"><Link to="/">العودة للرئيسية</Link></Button>
      </div>
    </div>
  );
};

export default NotFound;

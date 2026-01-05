import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

const CMSPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.get<PageData>(`/public/pages/${slug}`);
        setPage(data);
        if (data.metaTitle) {
          document.title = data.metaTitle;
        }
      } catch (err: any) {
        console.error('Error fetching page:', err);
        setError(err.response?.data?.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-page-not-found">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The page you're looking for doesn't exist."}</p>
          <Link to="/" className="text-primary hover:underline" data-testid="link-back-home">
            <ChevronLeft className="inline h-4 w-4" /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center" data-testid="text-page-title">
            {page.title}
          </h1>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div 
            className="prose prose-lg dark:prose-invert max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: page.content }}
            data-testid="div-page-content"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CMSPage;

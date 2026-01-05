import { brands } from "@/data/products";

const BrandSlider = () => {
  return (
    <section className="py-8 px-4 bg-muted/50">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
            🏆 Top Brands
          </h2>
          <p className="text-muted-foreground text-sm">
            Trusted by thousands of happy customers
          </p>
        </div>

        {/* Brand Cards */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 min-w-max px-2">
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                className="flex-shrink-0 w-[160px] md:w-[180px] bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {brand.logo}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;

import { Truck, RefreshCw, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7 days return policy",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support",
  },
];

const PromoBar = () => {
  return (
    <section className="py-8 px-4 border-y border-border bg-card">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-2.5 rounded-full bg-rose-light">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBar;

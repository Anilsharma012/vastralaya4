import { X } from "lucide-react";
import { useState } from "react";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-rose-dark text-primary-foreground py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center">
        <p className="text-xs md:text-sm font-medium text-center">
          ✨ <span className="font-semibold">GRAND FESTIVE SALE</span> - Up to 40% Off on Bridal Collection! 
          <a href="#" className="underline ml-1 hover:no-underline">Shop Now</a>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;

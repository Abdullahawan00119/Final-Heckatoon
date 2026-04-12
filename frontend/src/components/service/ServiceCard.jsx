import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Star, Heart } from 'lucide-react';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  // Helper to determine mock "Seller Level" based on review count for aesthetic
  const getSellerLevel = (reviews) => {
    if (reviews > 50) return 'Top Rated Seller';
    if (reviews > 10) return 'Level 2 Seller';
    if (reviews > 0) return 'Level 1 Seller';
    return 'New Seller';
  };

  const preventNavigation = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Card 
      className="flex flex-col h-full border-none shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.06)] hover:shadow-[0_0.5rem_1rem_0_rgba(0,0,0,0.1)] transition-all group overflow-hidden cursor-pointer"
      onClick={() => navigate(`/services/${service.slug}`)}
    >
      <div className="relative overflow-hidden bg-slate-100 aspect-[4/3] w-full">
        {service.images?.[0] ? (
          <img 
            src={service.images[0]} 
            alt={service.title} 
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground font-medium text-sm">
            No Image Provided
          </div>
        )}
        
        {/* Fiverr-Style Heart Icon */}
        <button 
          onClick={preventNavigation}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm transition-colors z-10"
        >
          <Heart className="h-5 w-5 text-white" />
        </button>

        {/* Categories Overlaid like Tags */}
        <div className="absolute bottom-2 left-2 flex gap-1 z-10">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
            {service.category}
          </span>
        </div>
      </div>
      
      <CardContent className="flex-1 p-4 pb-0 flex flex-col gap-2">
        {/* Seller Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 border ring-1 ring-slate-100">
            <AvatarImage src={service.provider?.avatar} />
            <AvatarFallback className="bg-primary text-white text-xs">{service.provider?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col -gap-1">
            <span className="text-sm font-bold text-slate-800 hover:underline cursor-pointer" onClick={(e) => { preventNavigation(e); navigate(`/profile/${service.provider?._id}`); }}>
              {service.provider?.firstName} {service.provider?.lastName}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {getSellerLevel(service.totalReviews || 0)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-normal text-[15px] leading-tight text-[#404145] hover:text-primary transition-colors line-clamp-2 mt-1 min-h-[2.5rem]">
          {service.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-auto pb-1 mt-2">
          <Star className="h-[14px] w-[14px] fill-amber-500 text-amber-500" />
          <span className="font-bold text-sm text-[#404145]">{service.averageRating?.toFixed(1) || '5.0'}</span>
          <span className="text-muted-foreground text-sm">({service.totalReviews || 0})</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between p-4 pt-3 border-t border-slate-100 mt-2">
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <span className="text-slate-400">Delivery in:</span> 
          <span className="text-slate-700">{service.deliveryTime}</span>
        </div>
        <div className="text-right flex items-baseline gap-1">
          <span className="text-[10px] font-bold text-[#404145] uppercase tracking-wide">Starting At</span>
          <span className="font-bold text-lg text-slate-900">PKR {service.basePrice.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;

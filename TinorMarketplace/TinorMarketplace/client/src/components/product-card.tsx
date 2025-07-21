import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { ProductWithShop } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithShop;
  onBook: (productId: number) => void;
}

export function ProductCard({ product, onBook }: ProductCardProps) {
  const isLowStock = product.stock <= 5;
  const isExpiringSoon = product.expiryDate && 
    new Date(product.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days

  const getStockBadgeVariant = () => {
    if (product.stock === 0) return "destructive";
    if (isLowStock) return "secondary";
    return "default";
  };

  const getStockText = () => {
    if (product.stock === 0) return "Out of stock";
    if (isLowStock) return `${product.stock} left`;
    return `${product.stock} in stock`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            {product.brand && (
              <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
            )}
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
              <Badge variant={getStockBadgeVariant()} className="text-xs">
                {getStockText()}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">📦</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Shop:</span>
            <span className="font-medium text-gray-900">{product.shop.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Distance:</span>
            <span className="font-medium text-gray-900 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {product.distance?.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Expires:</span>
            <span className={`font-medium ${isExpiringSoon ? "text-red-600" : "text-gray-900"}`}>
              {formatDate(product.expiryDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Rating:</span>
            <div className="flex items-center space-x-1">
              <div className="flex">
                {renderStars(Math.round(product.shop.rating || 0))}
              </div>
              <span className="text-gray-600">{product.shop.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button 
            onClick={() => onBook(product.id)}
            disabled={product.stock === 0}
            className="flex-1"
            variant={product.stock === 0 ? "secondary" : "default"}
          >
            {product.stock === 0 ? "Out of Stock" : "Book Now"}
          </Button>
          <Button variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProductWithShop } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDistance, setSearchDistance] = useState("2");
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<ProductWithShop[]>({
    queryKey: ["/api/products/search", { q: searchQuery, distance: searchDistance }],
    enabled: hasSearched && searchQuery.length > 0,
  });

  const bookProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId: 1, // Mock user ID for demo
          quantity: 1,
          status: "pending",
        }),
      });
      if (!response.ok) throw new Error("Failed to book product");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Product has been reserved for you",
      });
      // Invalidate products query to refresh stock
      queryClient.invalidateQueries({ 
        queryKey: ["/api/products/search"] 
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to reserve product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (query: string, distance: string) => {
    setSearchQuery(query);
    setSearchDistance(distance);
    setHasSearched(true);
  };

  const handleCategoryFilter = (category: string) => {
    setSearchQuery(category);
    setSearchDistance("10");
    setHasSearched(true);
  };

  const handleBookProduct = (productId: number) => {
    bookProductMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <SearchBar onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasSearched && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-6 w-64" />
                ) : (
                  `Showing ${products.length} results for "${searchQuery}" within ${searchDistance} km`
                )}
              </h2>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  Sort by distance
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  Filter
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onBook={handleBookProduct}
                    />
                  ))}
                </div>
                
                {products.length >= 12 && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" size="lg">
                      Load More Results
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try searching with different keywords or increase the distance range.
                </p>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start searching for products
            </h3>
            <p className="text-gray-500">
              Enter a product name or category to find nearby shops with availability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

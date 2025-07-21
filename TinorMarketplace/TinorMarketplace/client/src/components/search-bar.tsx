import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, distance: string) => void;
  onCategoryFilter: (category: string) => void;
}

export function SearchBar({ onSearch, onCategoryFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [distance, setDistance] = useState("2");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, distance);
  };

  const categories = [
    { label: "Groceries", value: "groceries" },
    { label: "Medicine", value: "medicine" },
    { label: "Electronics", value: "electronics" },
    { label: "Books", value: "books" },
  ];

  return (
    <div className="bg-gradient-to-r from-primary/5 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Find Products
            <span className="text-primary ml-2">Near You</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover local shops with the products you need in stock. Compare prices, check availability, and reserve items instantly.
          </p>
        </div>
        
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="pl-10 py-3"
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Within 2 km</SelectItem>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="50">Any distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="flex-shrink-0 px-6 py-3">
                Search
              </Button>
            </form>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Quick filters:</span>
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onCategoryFilter(category.value)}
                  className="text-xs"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

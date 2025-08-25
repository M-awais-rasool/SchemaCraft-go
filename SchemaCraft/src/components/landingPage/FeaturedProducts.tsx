import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, Star } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Modern Oversized Blazer",
    description: "Elegant oversized blazer perfect for professional and casual wear",
    price: "$189",
    originalPrice: "$249",
    image: "https://images.unsplash.com/photo-1632773003373-6645a802c154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzU2MDE5MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    isNew: true,
    isSale: true
  },
  {
    id: 2,
    name: "Premium Leather Sneakers",
    description: "Handcrafted leather sneakers with premium comfort technology",
    price: "$299",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1543652711-77eeb35ae548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VycyUyMHNob2VzfGVufDF8fHx8MTc1NjExNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    isNew: false,
    isSale: false
  },
  {
    id: 3,
    name: "Designer Crossbody Bag",
    description: "Versatile crossbody bag crafted from genuine Italian leather",
    price: "$149",
    originalPrice: "$199",
    image: "https://images.unsplash.com/photo-1722340321190-1c7b7384e89b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaGFuZGJhZyUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc1NjExNzU0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    isNew: false,
    isSale: true
  },
  {
    id: 4,
    name: "Classic Aviator Sunglasses",
    description: "Timeless aviator sunglasses with UV protection and polarized lenses",
    price: "$129",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1722842529941-825976fc14f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHN1bmdsYXNzZXN8ZW58MXx8fHwxNzU2MTA2Nzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    isNew: true,
    isSale: false
  }
];

export function FeaturedProducts() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our hand-picked selection of premium products that define modern luxury and style.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        New
                      </Badge>
                    )}
                    {product.isSale && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="mb-2 line-clamp-1">{product.name}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button className="w-full transition-all duration-300 group-hover:bg-primary/90">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
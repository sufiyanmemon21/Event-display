import EllipsisLoader from "@/components/EllipsisLoader";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, Heart, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function ProductDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = [{
    name: "Black",
    value: "#000000",
    image: "https://images.unsplash.com/photo-1710472171218-da46dce3faf9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBuaWtlfGVufDB8fDB8fHww"
  }, {
    name: "White",
    value: "#ffffff",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2hpdGUlMjBuaWtlfGVufDB8fDB8fHww"
  }, {
    name: "Blue",
    value: "#2563eb",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymx1ZSUyMG5pa2V8ZW58MHx8MHx8fDA%3D"
  }, {
    name: "Red",
    value: "#dc2626",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmVkJTVDJTIwbmlrZXxlbnwwfHwwfHx8MA%3D%3D"
  }];
  const sizes = [38, 39, 40, 41, 42, 43];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(41);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await fetch(`https://6a5f186c98d9f02aed7a128d.mockapi.io/products/${id}`);
        if (!response.ok) throw new Error("Unable to load product details.");
        const data = await response.json();
        if (!data || Array.isArray(data) || !data.id || typeof data.name !== "string") throw new Error("Invalid product response.");
        setProduct(data);
      } catch (error) {
        console.error("Error fetching single product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSingleProduct();
    }
  }, [id]);
  if (loading) {
    return <EllipsisLoader scope="viewport" label="Loading product details" />;
  }
  if (!product) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p className="text-xl font-semibold text-red-500">Product details are unavailable.</p>
        <Button onClick={() => navigate("/products")}>Go Back To Products</Button>
      </div>;
  }
  return <div className="min-h-full bg-background text-foreground flex flex-col items-center gap-5">
      <div className="max-w-6xl w-full mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-muted text-foreground">
          <ArrowLeft size={18} /> Back to Products
        </Button>
      </div>

      <Card className="max-w-6xl w-full shadow-sm rounded-2xl bg-card text-card-foreground border-border">
        <CardContent className="grid md:grid-cols-2 gap-8 p-5 lg:p-8">
          <div className="flex justify-center items-center">
            <img src={product.image || selectedColor.image || "https://via.placeholder.com/400"} alt={product.name} className="rounded-xl object-cover w-full max-w-md h-96 border border-border bg-background" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-muted px-2 py-1 rounded text-muted-foreground border border-border">
                  ID: #{product.id}
                </span>
                {product.category && <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                    {product.category}
                  </span>}
              </div>
              <h1 className="text-3xl font-bold mt-2 text-foreground">{product.name}</h1>


              <p className="text-3xl font-bold mt-4 text-primary">
                ${product.price}
              </p>
            </div>
            <p className="text-muted-foreground">
              {product.description || "No description provided."}
            </p>
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Select Color</h3>
              <div className="flex gap-3">
                {colors.map(color => <Button variant="outline" key={color.name} aria-label={`Select ${color.name}`} aria-pressed={selectedColor.name === color.name} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor.name === color.name ? "border-primary scale-110" : "border-border"}`} style={{
                backgroundColor: color.value
              }} />)}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map(size => <Button key={size} variant={selectedSize === size ? "default" : "outline"} onClick={() => setSelectedSize(size)}>
                    {size}
                  </Button>)}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Quantity</h3>
              <div className="flex items-center gap-4">
                <Button aria-label="Decrease quantity" size="icon" variant="outline" onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}>
                  <Minus />
                </Button>

                <span className="text-2xl font-bold text-foreground">{quantity}</span>

                <Button aria-label="Increase quantity" size="icon" variant="outline" onClick={() => setQuantity(prev => prev + 1)}>
                  <Plus />
                </Button>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="flex-1" disabled title="No cart integration is implemented">Cart unavailable</Button>
              <Button variant="secondary" className="flex-1" disabled title="No checkout integration is implemented">
                Checkout unavailable
              </Button>
              <Button aria-label="Toggle local wishlist selection" aria-pressed={wishlist} variant="outline" size="icon" onClick={() => setWishlist(!wishlist)}>
                <Heart className={`${wishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}

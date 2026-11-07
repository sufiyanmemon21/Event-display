import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading } from "@/components/workspace";
import WorkspaceSelect from "@/components/workspace-select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Addproducts() {
  const navigate = useNavigate();
  const sizes = [38, 39, 40, 41, 42, 43];
  const colors = [{
    name: "Black",
    value: "#000000"
  }, {
    name: "White",
    value: "#ffffff"
  }, {
    name: "Blue",
    value: "#2563eb"
  }, {
    name: "Red",
    value: "#dc2626"
  }, {
    name: "Green",
    value: "#16a34a"
  }];
  const toastConfig = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Zoom
  };
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Shoes",
    brand: "",
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    image: ""
  });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [status, setStatus] = useState({
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSizeToggle = size => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };
  const handleColorToggle = colorName => {
    setSelectedColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        sizes: selectedSizes,
        colors: selectedColors,
        status: status
      };
      const response = await axios.post("https://6a5f186c98d9f02aed7a128d.mockapi.io/products", payload);
      if (response.status === 201 || response.status === 200) {
        toast.success("Product Successfully Added!", toastConfig);
        setFormData({
          name: "",
          description: "",
          category: "Shoes",
          brand: "",
          price: "",
          discountPrice: "",
          stock: "",
          sku: "",
          image: ""
        });
        setSelectedSizes([]);
        setSelectedColors([]);
        setStatus({
          isFeatured: false,
          isBestSeller: false,
          isNewArrival: false
        });
        setPreviewUrl(null);
        setTimeout(() => {
          navigate("/products");
        }, 1500);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to add product: " + (error.response?.data || error.message), toastConfig);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-full bg-background text-foreground py-2">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        <PageHeading title="Add product" description="Create a product using the existing catalog workflow." />

        <form onSubmit={handleSubmit} className="grid items-start lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-6">
          <Card className="lg:col-span-1 bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label>Product Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nike Air Max 270" required />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Write product description..." />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <WorkspaceSelect name="category" value={formData.category} onChange={handleChange} className="w-full h-10 rounded-md border border-input bg-background px-3 text-foreground">
                    <option value="Shoes">Shoes</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Accessories">Accessories</option>
                  </WorkspaceSelect>
                </div>

                <div>
                  <Label>Brand</Label>
                  <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="Nike" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="199" required />
                </div>

                <div>
                  <Label>Discount Price ($)</Label>
                  <Input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="149" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Stock</Label>
                  <Input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="100" />
                </div>

                <div>
                  <Label>SKU</Label>
                  <Input name="sku" value={formData.sku} onChange={handleChange} placeholder="NK-001" />
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Available Sizes</Label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return <Button variant="outline" type="button" key={size} onClick={() => handleSizeToggle(size)} className={`h-10 w-14 rounded-lg border transition ${isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                        {size}
                      </Button>;
                })}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Available Colors</Label>
                <div className="flex gap-4">
                  {colors.map(color => {
                  const isSelected = selectedColors.includes(color.name);
                  return <Button variant="outline" type="button" key={color.name} onClick={() => handleColorToggle(color.name)} className={`w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "ring-2 ring-primary scale-110" : "border-border"}`} style={{
                    backgroundColor: color.value
                  }} title={color.name} />;
                })}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle>Product Images & Status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label>Main Image URL</Label>
                <Input type="text" value={formData.image} name="image" onChange={e => {
                handleChange(e);
                setPreviewUrl(e.target.value);
              }} placeholder="Paste Image URL here" />
              </div>

              <div>
                <Label>Status</Label>
                <div className="space-y-3 mt-3">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Input type="checkbox" checked={status.isFeatured} onChange={e => setStatus({
                    ...status,
                    isFeatured: e.target.checked
                  })} />
                    Featured Product
                  </Label>

                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={status.isBestSeller} onCheckedChange={checked => setStatus({
                    ...status,
                    isBestSeller: checked === true
                  })} />
                    Best Seller
                  </Label>

                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={status.isNewArrival} onCheckedChange={checked => setStatus({
                    ...status,
                    isNewArrival: checked === true
                  })} />
                    New Arrival
                  </Label>
                </div>
              </div>
              <div>
                <Label>Preview</Label>
                <div className="mt-3 h-56 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground overflow-hidden bg-background">
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : "Image Preview"}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>;
}

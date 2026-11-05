import { useConfirmation } from "@/hooks/useConfirmation";
import { toast } from "react-toastify";
import { PageHeading } from "@/components/workspace";
import { Label } from "@/components/ui/label";
import WorkspaceSelect from "@/components/workspace-select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export default function ProductsList() {
  const confirm = useConfirmation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const API_URL = "https://6a5f186c98d9f02aed7a128d.mockapi.io/products";
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Failed to load products.");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid products response.");
        }
        if (!controller.signal.aborted) {
          setProducts(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch Error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => controller.abort();
  }, []);
  const dynamicCategories = ["All", ...new Set(products.map(p => p.category).filter(cat => cat && cat.trim() !== ""))];
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!(await confirm("Delete this product permanently?"))) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Product deleted.");
        setProducts(products.filter(item => item.id !== id));
      } else {
        toast.error("Unable to delete product.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };
  const handleEditClick = (product, e) => {
    e.stopPropagation();
    setEditingProduct(product);
  };
  const handleUpdateSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingProduct)
      });
      if (response.ok) {
        toast.success("Product updated.");
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error("Unable to update product.");
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };
  const filteredProducts = selectedCategory === "All" ? products : products.filter(product => product.category === selectedCategory);
  if (loading) return <p className="p-8 text-center font-bold text-foreground bg-background min-h-full">
        Products Are Loading Please Wait
      </p>;
  return <div className="min-h-full bg-background text-foreground py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <PageHeading title="Product catalog" description="Browse and manage the existing product collection." />
          </div>
          <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border shadow-sm">
            <Label htmlFor="product-category-filter" className="text-sm font-semibold text-card-foreground whitespace-nowrap">
              Filter by Category:
            </Label>
            <WorkspaceSelect id="product-category-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              {dynamicCategories.map(cat => <option key={cat} value={cat}>
                  {cat}
                </option>)}
            </WorkspaceSelect>
          </div>
        </div>
        {filteredProducts.length === 0 ? <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground font-medium">There are no products.</p>
          </div> : <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="p-4">ID</TableHead>
                    <TableHead className="p-4">Product</TableHead>
                    <TableHead className="p-4">Category</TableHead>
                    <TableHead className="p-4">Brand</TableHead>
                    <TableHead className="p-4">Price</TableHead>
                    <TableHead className="p-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => <TableRow key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                      <TableCell className="p-4 text-xs font-mono font-bold text-muted-foreground">
                        #{product.id}
                      </TableCell>
                      <TableCell className="min-w-[280px] p-4">
                        <div className="flex items-center gap-4">
                          <img src={product.image || "https://via.placeholder.com/150"} alt={product.name} className="w-16 h-16 object-cover rounded-md border border-border flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-1 hover:underline">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {product.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground border border-border">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-sm text-muted-foreground">
                        {product.brand || "-"}
                      </TableCell>
                      <TableCell className="p-4 text-base font-bold text-primary">
                        ${product.price}
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={e => handleEditClick(product, e)} size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button onClick={e => handleDelete(product.id, e)} size="sm" variant="destructive">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
          </div>}
        <Dialog open={Boolean(editingProduct)} onOpenChange={open => {
        if (!open) setEditingProduct(null);
      }}>
          {editingProduct && <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Product #{editingProduct.id}</DialogTitle>
              </DialogHeader>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-card-foreground">Product Name</Label>
                    <Input value={editingProduct.name || ""} onChange={e => setEditingProduct({
                ...editingProduct,
                name: e.target.value
              })} required />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-card-foreground">Image URL</Label>
                    <Input type="text" placeholder="https://example.com/image.jpg" value={editingProduct.image || ""} onChange={e => setEditingProduct({
                ...editingProduct,
                image: e.target.value
              })} />
                    {editingProduct.image && <div className="mt-2 h-24 w-full rounded border border-border overflow-hidden bg-background flex items-center justify-center">
                        <img src={editingProduct.image} alt="Preview" className="h-full object-contain" onError={e => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=Invalid+URL";
                }} />
                      </div>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-card-foreground">Category</Label>
                    <Input type="text" value={editingProduct.category || ""} onChange={e => setEditingProduct({
                ...editingProduct,
                category: e.target.value
              })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground mt-1" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-card-foreground">Price ($)</Label>
                    <Input type="number" value={editingProduct.price || ""} onChange={e => setEditingProduct({
                ...editingProduct,
                price: e.target.value
              })} required />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-card-foreground">Description</Label>
                    <Input value={editingProduct.description || ""} onChange={e => setEditingProduct({
                ...editingProduct,
                description: e.target.value
              })} />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
            </DialogContent>}
        </Dialog>
      </div>
    </div>;
}

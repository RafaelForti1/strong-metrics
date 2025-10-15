import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Inventory = () => {
  const products = [
    {
      id: 1,
      name: "Whey Protein 900g",
      category: "Suplementos",
      stock: 45,
      minStock: 20,
      price: 89.90,
    },
    {
      id: 2,
      name: "Creatina 300g",
      category: "Suplementos",
      stock: 8,
      minStock: 15,
      price: 65.00,
    },
    {
      id: 3,
      name: "Camisa Dry Fit",
      category: "Vestuário",
      stock: 32,
      minStock: 10,
      price: 49.90,
    },
    {
      id: 4,
      name: "Luvas de Treino",
      category: "Acessórios",
      stock: 18,
      minStock: 10,
      price: 29.90,
    },
    {
      id: 5,
      name: "Squeeze 1L",
      category: "Acessórios",
      stock: 5,
      minStock: 15,
      price: 19.90,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerencie produtos e suplementos</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingProduct(null);
          setProductFormOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((acc, p) => acc + p.stock, 0)} unidades
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {products.filter(p => p.stock < p.minStock).length} itens
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estoque: {product.stock} un.
                    </p>
                  </div>
                  {product.stock < product.minStock ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Baixo
                    </Badge>
                  ) : (
                    <Badge variant="default">Normal</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;

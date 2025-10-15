import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign, Users, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/** ===== Tipos ===== */
type TxRow = Database["public"]["Tables"]["transactions"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface WeeklyPoint {
  day: string;
  value: number;
}
interface CategoryPoint {
  name: string;
  value: number;
}

const WEEK_DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const Dashboard = () => {
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyPoint[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryPoint[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [retentionRate, setRetentionRate] = useState<number>(0);

  const weeklyGoal = 35000;

  /** ===== Helpers ===== */
  const groupByWeekday = (
    transactions: Pick<TxRow, "amount" | "created_at">[]
  ): WeeklyPoint[] => {
    const result: WeeklyPoint[] = WEEK_DAYS_PT.map((d) => ({
      day: d,
      value: 0,
    }));
    for (const t of transactions) {
      const dayIndex = new Date(t.created_at as string).getDay();
      result[dayIndex].value += Number(t.amount ?? 0);
    }
    return result;
  };

  const groupByCategory = (
    transactions: Pick<TxRow, "amount" | "category">[]
  ): CategoryPoint[] => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      const key = String(t.category ?? "Não informado");
      const prev = map.get(key) ?? 0;
      map.set(key, prev + Number(t.amount ?? 0));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  };

  /** ===== Fetch ===== */
  const fetchData = useCallback(async () => {
    // Promises tipadas sem casts para Promise, usando .returns<...>()
    const txPromise = supabase
      .from("transactions")
      .select("amount, created_at, category")
      .returns<Pick<TxRow, "amount" | "created_at" | "category">[]>();

    const activeClientsPromise = supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    const totalClientsPromise = supabase
      .from("clients")
      .select("id", { count: "exact", head: true });

    const totalProductsPromise = supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    const lowStockPromise = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lt("quantity", 5);

    const [
      txRes,
      activeClientsRes,
      totalClientsRes,
      totalProductsRes,
      lowStockRes,
    ] = await Promise.all([
      txPromise,
      activeClientsPromise,
      totalClientsPromise,
      totalProductsPromise,
      lowStockPromise,
    ]);

    // 1) Transações
    if (txRes.error) {
      console.error("Erro ao buscar transactions:", txRes.error);
    } else if (txRes.data) {
      const safeTx = txRes.data;
      setWeeklyRevenue(groupByWeekday(safeTx));
      setCategoriesData(groupByCategory(safeTx));
    }

    // 2) & 3) Retenção = ativos / total
    const activeCount = activeClientsRes.count ?? 0;
    const totalClients = totalClientsRes.count ?? 0;
    setStudentsCount(activeCount);
    const retentionPct =
      totalClients > 0 ? (activeCount / totalClients) * 100 : 0;
    setRetentionRate(Number(retentionPct.toFixed(1)));

    // 4) Produtos total e baixo estoque
    const totalProducts = totalProductsRes.count ?? 0;
    const lowStock = lowStockRes.count ?? 0;
    setProductsCount(totalProducts);
    setLowStockCount(lowStock);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const weeklyTotal = useMemo(
    () => weeklyRevenue.reduce((acc, curr) => acc + curr.value, 0),
    [weeklyRevenue]
  );
  const goalPercentage = useMemo(
    () => Number(((weeklyTotal / weeklyGoal) * 100).toFixed(1)),
    [weeklyTotal]
  );

  const COLORS = useMemo(
    () => ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"],
    []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Faturamento Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {weeklyTotal.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              {goalPercentage}% da meta (R$ {weeklyGoal.toLocaleString("pt-BR")}
              )
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Produtos em Estoque</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-warning">
              {lowStockCount} itens em baixo estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Taxa de Retenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoriesData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

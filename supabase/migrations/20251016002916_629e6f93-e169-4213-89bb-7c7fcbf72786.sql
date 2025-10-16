-- Corrigir políticas RLS para proteger dados sensíveis de clientes

-- 1. Remover políticas antigas inseguras da tabela clients
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients they created or admins" ON clients;

-- 2. Criar políticas seguras para clients - apenas criador e admins
CREATE POLICY "Users can view their own clients or admins can view all"
ON clients FOR SELECT
USING (
  created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create clients"
ON clients FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own clients or admins can update all"
ON clients FOR UPDATE
USING (
  created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete clients"
ON clients FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Remover políticas antigas inseguras da tabela client_plans
DROP POLICY IF EXISTS "Authenticated users can manage client plans" ON client_plans;
DROP POLICY IF EXISTS "Authenticated users can view client plans" ON client_plans;

-- 4. Criar políticas seguras para client_plans - apenas admins podem modificar
CREATE POLICY "Users can view plans of their clients or admins view all"
ON client_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = client_plans.client_id
    AND (clients.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Only admins can create client plans"
ON client_plans FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update client plans"
ON client_plans FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete client plans"
ON client_plans FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Melhorar política de attendance para proteger dados pessoais
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON attendance;
DROP POLICY IF EXISTS "Authenticated users can create attendance" ON attendance;

CREATE POLICY "Users can view attendance of their clients or admins view all"
ON attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = attendance.client_id
    AND (clients.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can create attendance for their clients"
ON attendance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = attendance.client_id
    AND (clients.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Admins can update attendance"
ON attendance FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete attendance"
ON attendance FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
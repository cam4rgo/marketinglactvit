-- Inserir dados de teste para representantes comerciais
INSERT INTO comercial_representatives (
  user_id,
  nome_completo,
  telefone,
  escritorio,
  cidades_atendidas,
  estado,
  tipo,
  status,
  link_whatsapp
) VALUES 
(
  '77fd91de-f2a7-4baa-a44f-19227a1da13a',
  'João Silva',
  '(11) 99999-1234',
  'Escritório São Paulo',
  ARRAY['São Paulo', 'Guarulhos', 'Osasco'],
  'SP',
  'representante',
  'ativo',
  'https://wa.me/5511999991234'
),
(
  '77fd91de-f2a7-4baa-a44f-19227a1da13a',
  'Maria Santos',
  '(21) 98888-5678',
  'Escritório Rio de Janeiro',
  ARRAY['Rio de Janeiro', 'Niterói', 'Duque de Caxias'],
  'RJ',
  'broker',
  'ativo',
  'https://wa.me/5521988885678'
),
(
  '77fd91de-f2a7-4baa-a44f-19227a1da13a',
  'Carlos Oliveira',
  '(31) 97777-9012',
  'Escritório Belo Horizonte',
  ARRAY['Belo Horizonte', 'Contagem', 'Betim'],
  'MG',
  'representante',
  'ativo',
  'https://wa.me/5531977779012'
),
(
  '77fd91de-f2a7-4baa-a44f-19227a1da13a',
  'Ana Costa',
  '(85) 96666-3456',
  'Escritório Fortaleza',
  ARRAY['Fortaleza', 'Caucaia', 'Maracanaú'],
  'CE',
  'broker',
  'ativo',
  'https://wa.me/5585966663456'
),
(
  '77fd91de-f2a7-4baa-a44f-19227a1da13a',
  'Pedro Ferreira',
  '(65) 95555-7890',
  'Escritório Cuiabá',
  ARRAY['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
  'MT',
  'representante',
  'ativo',
  'https://wa.me/5565955557890'
);

-- Verificar se os dados foram inseridos
SELECT 
  nome_completo,
  estado,
  cidades_atendidas,
  tipo,
  status
FROM comercial_representatives 
WHERE status = 'ativo'
ORDER BY created_at DESC;
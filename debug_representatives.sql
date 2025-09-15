-- Query para verificar dados de representantes
SELECT 
  id,
  nome_completo,
  estado,
  cidades_atendidas,
  tipo,
  status,
  created_at
FROM comercial_representatives 
WHERE status = 'ativo'
ORDER BY created_at DESC
LIMIT 10;

-- Contar total de representantes ativos
SELECT 
  COUNT(*) as total_ativos,
  COUNT(CASE WHEN tipo = 'representante' THEN 1 END) as representantes,
  COUNT(CASE WHEN tipo = 'broker' THEN 1 END) as brokers
FROM comercial_representatives 
WHERE status = 'ativo';

-- Verificar estados únicos
SELECT DISTINCT estado, COUNT(*) as quantidade
FROM comercial_representatives 
WHERE status = 'ativo' AND estado IS NOT NULL
GROUP BY estado
ORDER BY quantidade DESC;
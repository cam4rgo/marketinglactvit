// Teste automatizado para verificar o funcionamento do MapModal
// Execute este arquivo no console do navegador na página /comercial

console.log('🧪 [TESTE] Iniciando teste do MapModal...');

// Aguardar a página carregar completamente
setTimeout(() => {
  console.log('🧪 [TESTE] Procurando botão do mapa...');
  
  // Encontrar o botão do mapa
  const mapButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Mapa')
  );
  
  if (mapButton) {
    console.log('🧪 [TESTE] Botão do mapa encontrado! Clicando...');
    mapButton.click();
    
    // Aguardar o modal abrir e verificar logs
    setTimeout(() => {
      console.log('🧪 [TESTE] Verificando se o modal foi aberto...');
      
      const modal = document.querySelector('[role="dialog"]') || 
                   document.querySelector('.modal') ||
                   document.querySelector('[data-testid="map-modal"]');
      
      if (modal) {
        console.log('🧪 [TESTE] ✅ Modal encontrado no DOM!');
        console.log('🧪 [TESTE] Aguardando logs do useMapData...');
        
        // Aguardar mais tempo para logs do useMapData
        setTimeout(() => {
          console.log('🧪 [TESTE] Teste concluído. Verifique os logs acima para ver se o useMapData foi executado.');
        }, 3000);
      } else {
        console.log('🧪 [TESTE] ❌ Modal não encontrado no DOM!');
      }
    }, 1000);
  } else {
    console.log('🧪 [TESTE] ❌ Botão do mapa não encontrado!');
  }
}, 2000);

console.log('🧪 [TESTE] Script carregado. Aguardando execução...');
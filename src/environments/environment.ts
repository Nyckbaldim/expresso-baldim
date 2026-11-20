export const environment = {
  production: true,
  /** Base da API. Troque pelo endereço real do back-end. */
  apiUrl: '/api',
  /**
   * true  = usa dados de exemplo (login admin / admin123 e 47 pedidos fictícios).
   * false = chama a API de verdade. Coloque false assim que o back-end existir.
   */
  useMock: true,
};

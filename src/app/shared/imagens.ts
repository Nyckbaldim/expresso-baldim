export const QUANTIDADE_MAXIMA_FOTOS = 6;
export const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB por foto
export const TIPOS_ACEITOS = ['image/jpeg', 'image/png'];

export function reduzirImagem(arquivo: File, ladoMax = 900, qualidade = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const contexto = canvas.getContext('2d');
        if (!contexto) {
          reject(new Error('Canvas indisponível.'));
          return;
        }
        contexto.fillStyle = '#ffffff'; // PNG com fundo transparente vira branco no JPEG
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}
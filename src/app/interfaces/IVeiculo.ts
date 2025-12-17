export interface IVeiculo {

  id: number;
  marca: string;
  modelo: string;
  ano: number;
  km?: number;
  preco: number;
  descricao: string;
  urlsFotos: string[];
  cor?: string;
  motor?: string;
  cambio?: string;
  combustivel?: string;
  emOferta?: boolean;
  imagem: Blob | null;
  vendido?: boolean;
  placa?: string;
}

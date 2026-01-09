import { IMarca } from './IMarca';
import { IModelo } from './IModelo';

export interface IVeiculo {

  id: number;
  marca: IMarca;
  modelo: IModelo;
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
  infoVenda?: string;
}

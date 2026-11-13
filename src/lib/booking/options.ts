/** Opções do formulário. Não afirmam nada comercial (sem preço, prazo ou fornecimento de suporte). */
export const tvSizes = ['Até 32"', '40" a 43"', '48" a 50"', '55"', '58" a 65"', '70" ou mais', "Não sei"] as const;
export const supportTypes = ["Fixo", "Articulado", "De teto", "Pedestal", "Ainda não sei"] as const;
export const wallTypes = ["Alvenaria", "Drywall", "Madeira / painel", "Outro", "Não sei"] as const;
export const hasSupportOptions = ["Já tenho o suporte", "Preciso de orientação"] as const;
export const repairBrands = ["Samsung", "Sony", "TCL", "LG", "Philips", "Outra marca"] as const;
export const symptoms = [
  "Não liga",
  "Sem imagem",
  "Sem som",
  "Imagem com falhas",
  "Entradas/conexões",
  "Outro",
] as const;
export const periods = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "qualquer", label: "Qualquer horário" },
] as const;
export type PeriodValue = (typeof periods)[number]["value"];

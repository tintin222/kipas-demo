export const tl = (n: number): string =>
  `${Math.round(n).toLocaleString("tr-TR")} TL`;

export const tlKisa = (n: number): string => {
  const mutlak = Math.abs(n);
  if (mutlak >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} mn TL`;
  if (mutlak >= 1_000) return `${Math.round(n / 1000).toLocaleString("tr-TR")} bin TL`;
  return `${Math.round(n)} TL`;
};

export const ton = (n: number): string =>
  `${Math.round(n).toLocaleString("tr-TR")} t`;

export const yuzde = (n: number, basamak = 0): string =>
  `%${(n * 100).toFixed(basamak).replace(".", ",")}`;

export const gun = (n: number): string =>
  `${n.toFixed(1).replace(".", ",")} gün`;

const AYLAR = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export const tarih = (iso: string): string => {
  const [yil, ay, gunNo] = iso.split("-");
  return `${gunNo} ${AYLAR[Number(ay) - 1]} ${yil}`;
};

export const tarihKisa = (iso: string): string => {
  const [, ay, gunNo] = iso.split("-");
  return `${gunNo} ${AYLAR[Number(ay) - 1]}`;
};

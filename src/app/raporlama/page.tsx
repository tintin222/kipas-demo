"use client";

import Link from "next/link";
import { BulguKarti, Kpi, Rozet } from "@/components/Parcalar";
import { tlKisa, ton, yuzde } from "@/lib/bicim";
import { SIRKETLER, sirketBul } from "@/data/raporlama";
import { marj } from "@/lib/raporlama";
import { ayAdi } from "@/senaryolar/raporlama/senaryo";
import { useRaporBaglami } from "@/senaryolar/raporlama/Saglayici";

export default function RaporKontrolKulesi() {
  const { kosu, cikti } = useRaporBaglami();
  const { toplam, oncekiToplam, sapmalar, donemKayitlari, ilkDonemKayitlari } = cikti;
  const marjFarki = (toplam.marj - oncekiToplam.marj) * 100;

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Holding yönetim raporu</h1>
          <p>
            {ayAdi(cikti.donem)} dönemi, {SIRKETLER.length} şirket. Sapmalar
            yüzdeye göre değil TL etkisine göre sıralı; yönetimin zamanı en çok
            paranın olduğu yere gitsin diye.
          </p>
        </div>
        <Rozet tur={sapmalar.length > 0 ? "uyari" : "iyi"}>
          {sapmalar.length > 0
            ? `${sapmalar.length} sapma`
            : "Eşik dışında sapma yok"}
        </Rozet>
      </div>

      <div className="izgara izgara-4">
        {kosu.ozetMetrikler.map((m) => (
          <Kpi
            key={m.etiket}
            etiket={m.etiket}
            deger={m.deger}
            aciklama={m.aciklama}
            yon={m.yon}
          />
        ))}
      </div>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Şirketler</h2>
            <p>
              Dönem rakamları ve dönem başına göre değişim. Marj sütunundaki
              puan farkı, sapma eşiğinin uygulandığı ölçüt.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Şirket</th>
                  <th className="sayisal">Ciro</th>
                  <th className="sayisal">Plana göre</th>
                  <th className="sayisal">Brüt kâr</th>
                  <th className="sayisal">Marj</th>
                  <th className="sayisal">Marj değişimi</th>
                  <th className="sayisal">Kapasite</th>
                  <th className="sayisal">Stok kapsama</th>
                </tr>
              </thead>
              <tbody>
                {donemKayitlari.map((k) => {
                  const s = sirketBul(k.sirketId)!;
                  const ilk = ilkDonemKayitlari.find(
                    (x) => x.sirketId === k.sirketId,
                  )!;
                  const puanFarki = (marj(k) - marj(ilk)) * 100;
                  const planOrani = k.ciroTL / k.planCiroTL;
                  const sapmaSayisi = sapmalar.filter(
                    (x) => x.sirketId === k.sirketId,
                  ).length;
                  return (
                    <tr key={k.sirketId}>
                      <td>
                        <div className="satir">
                          <b>{s.ad}</b>
                          {sapmaSayisi > 0 ? (
                            <Rozet tur="uyari">{sapmaSayisi}</Rozet>
                          ) : null}
                        </div>
                        <div className="ikincil">{s.sektor}</div>
                      </td>
                      <td className="sayisal">{tlKisa(k.ciroTL)}</td>
                      <td className="sayisal">
                        {yuzde(planOrani, 0)}
                        <div className="ikincil">{tlKisa(k.planCiroTL)} plan</div>
                      </td>
                      <td className="sayisal">{tlKisa(k.ciroTL - k.maliyetTL)}</td>
                      <td className="sayisal">{yuzde(marj(k), 1)}</td>
                      <td className="sayisal">
                        {puanFarki > 0 ? "+" : ""}
                        {puanFarki.toFixed(1).replace(".", ",")} puan
                      </td>
                      <td className="sayisal">
                        {s.kapasiteTon > 0 ? (
                          <>
                            {yuzde(k.kapasiteKullanimi, 0)}
                            <div className="ikincil">{ton(k.uretimTon)}</div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="sayisal">
                        {k.stokGunKapsama} gün
                        <div className="ikincil">{tlKisa(k.stokDegeriTL)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="dipnot">
            Dönem başı {ayAdi(cikti.ilkDonemKayitlari[0]!.ay)}; karşılaştırma tek
            bir önceki aya değil oraya göre yapılıyor, tek aylık dalgalanma sapma
            sanılmasın diye. Şirket bazında eğilim için{" "}
            <Link href="/raporlama/sirketler">şirketler ekranına</Link> bakın.
          </p>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Karar bekleyen sapmalar</h2>
            <p>
              TL etkisine göre sıralı. Holding brüt marjı dönem başına göre{" "}
              {Math.abs(marjFarki).toFixed(1).replace(".", ",")} puan{" "}
              {marjFarki < 0 ? "daraldı" : "genişledi"}.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="yigin">
            {kosu.bulgular.map((b) => (
              <BulguKarti key={b.id} bulgu={b} />
            ))}
          </div>
          {kosu.bulgular.length === 0 ? (
            <div className="vurgu-kutu">
              Tanımlı eşiklerin dışına çıkan sapma yok. Bu da bir sonuçtur;
              uydurma bir endişe üretmektense söylenmesi doğru.
            </div>
          ) : null}
          <p className="dipnot">
            Yazıya dökülmüş hâli için{" "}
            <Link href="/raporlama/ozet">yönetim özetine</Link> bakın.
          </p>
        </div>
      </section>
    </div>
  );
}

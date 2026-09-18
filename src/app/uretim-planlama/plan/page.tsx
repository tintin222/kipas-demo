"use client";

import { useEffect } from "react";
import { HATLAR, UFUK_GUN, urunBul } from "@/data/seed";
import { gunuTariheCevir } from "@/lib/planner";
import { BulguKarti, GanttCizgisi, Rozet, kampanyaRengi } from "@/components/Parcalar";
import { gun, tarihKisa, tl, tlKisa, ton, yuzde } from "@/lib/bicim";
import { usePlanBaglami, type Secim } from "@/senaryolar/uretim-planlama/Saglayici";
import type { LineId } from "@/lib/types";

export default function PlanSayfasi() {
  const {
    kosu,
    cikti,
    durum,
    gorunurAdim,
    ajaniBaslat,
    secim,
    secimiDegistir,
    aktifPlan,
    kampanyaTasi,
    onaylandi,
    onayla,
    onayiGeriAl,
  } = usePlanBaglami();

  useEffect(() => {
    if (durum === "hazir") ajaniBaslat();
  }, [durum, ajaniBaslat]);

  const { mevcut } = cikti;
  const bitti = durum === "tamam";
  const karar = kosu.kararlar[0];

  const farklar = [
    {
      etiket: "Termini kaçan sipariş",
      mevcut: `${mevcut.gecikenSiparis}`,
      yeni: `${aktifPlan.gecikenSiparis}`,
      iyi: aktifPlan.gecikenSiparis <= mevcut.gecikenSiparis,
    },
    {
      etiket: "Sözleşme cezası",
      mevcut: tl(mevcut.gecikmeCezasiTL),
      yeni: tl(aktifPlan.gecikmeCezasiTL),
      iyi: aktifPlan.gecikmeCezasiTL <= mevcut.gecikmeCezasiTL,
    },
    {
      etiket: "Ürün geçiş maliyeti",
      mevcut: tl(mevcut.gecisMaliyetiTL),
      yeni: tl(aktifPlan.gecisMaliyetiTL),
      iyi: aktifPlan.gecisMaliyetiTL <= mevcut.gecisMaliyetiTL,
    },
    {
      etiket: "İhtiyaç dışı üretim",
      mevcut: `${ton(mevcut.ihtiyacDisiUretimTon)} · ${tlKisa(mevcut.ihtiyacDisiSermayeTL)}`,
      yeni: `${ton(aktifPlan.ihtiyacDisiUretimTon)} · ${tlKisa(aktifPlan.ihtiyacDisiSermayeTL)}`,
      iyi: aktifPlan.ihtiyacDisiUretimTon <= mevcut.ihtiyacDisiUretimTon,
    },
    {
      etiket: "Karşılanamayan sipariş",
      mevcut: ton(mevcut.karsilanamayanTon),
      yeni: ton(aktifPlan.karsilanamayanTon),
      iyi: aktifPlan.karsilanamayanTon <= mevcut.karsilanamayanTon,
    },
    {
      etiket: "Toplam ölçülen maliyet",
      mevcut: tl(mevcut.toplamMaliyetTL),
      yeni: tl(aktifPlan.toplamMaliyetTL),
      iyi: aktifPlan.toplamMaliyetTL <= mevcut.toplamMaliyetTL,
    },
  ];

  const kazanc = mevcut.toplamMaliyetTL - aktifPlan.toplamMaliyetTL;

  return (
    <main className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Üretim programı önerisi</h1>
          <p>
            Ajan sipariş defterini, stok lotlarını ve hat kapasitesini okuyup
            {" "}{UFUK_GUN} günlük programı kendisi kuruyor. Kararı veren siz
            olursunuz; ajan gerekçesini ve rakamını yazar.
          </p>
        </div>
        <button
          className="dugme"
          onClick={ajaniBaslat}
          disabled={durum === "calisiyor"}
        >
          {durum === "calisiyor" ? "Ajan çalışıyor…" : "Ajanı yeniden çalıştır"}
        </button>
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Ajan çalışması</h2>
            <p>
              {cikti.denenenAlternatif} sıralama senaryosu simüle edildi; her
              adımda ne bulduğu aşağıda.
            </p>
          </div>
          {bitti ? (
            <Rozet tur="iyi">Tamamlandı</Rozet>
          ) : (
            <Rozet tur="bilgi">Çalışıyor</Rozet>
          )}
        </div>
        <div className="kart-govde">
          <div className="adim-listesi">
            {kosu.adimlar.map((a, i) => {
              const gorunur = i < gorunurAdim;
              const calisiyor = i === gorunurAdim - 1 && durum === "calisiyor";
              return (
                <div
                  key={a.baslik}
                  className={`adim ${gorunur ? "gorunur" : ""} ${
                    gorunur && !calisiyor ? "tamam" : ""
                  } ${calisiyor ? "calisiyor" : ""}`}
                >
                  <div className="adim-isaret">{gorunur && !calisiyor ? "✓" : i + 1}</div>
                  <div>
                    <div className="adim-baslik">{a.baslik}</div>
                    <div className="adim-detay">{a.detay}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {bitti ? (
        <>
          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>{karar.baslik}</h2>
                <p>{karar.aciklama}</p>
              </div>
            </div>
            <div className="kart-govde">
              <div className="secenekler">
                {karar.secenekler.map((s) => {
                  const secimId = (
                    { maliyet: "maliyet", termin: "termin", mevcut: "mevcut" } as const
                  )[s.id as "maliyet" | "termin" | "mevcut"];
                  return (
                    <button
                      key={s.id}
                      className={`secenek ${secim === secimId ? "secili" : ""}`}
                      onClick={() => secimiDegistir(secimId as Secim)}
                    >
                      <div className="secenek-etiket">
                        {s.etiket}
                        {karar.onerilen === s.id ? (
                          <Rozet tur="iyi">Ajanın önerisi</Rozet>
                        ) : null}
                      </div>
                      <div className="secenek-ozet">{s.ozet}</div>
                    </button>
                  );
                })}
              </div>
              {secim === "duzenlenmis" ? (
                <div className="uyari-kutu" style={{ marginTop: 12 }}>
                  Programı elle düzenlediniz. Aşağıdaki rakamlar sizin
                  sıralamanıza göre yeniden hesaplandı.
                </div>
              ) : null}
            </div>
          </section>

          <div className="izgara izgara-2" style={{ marginTop: 16 }}>
            <section className="kart">
              <div className="kart-baslik">
                <div>
                  <h2>Ölçülen fark</h2>
                  <p>
                    Mevcut program → {aktifPlan.ad}. Üretilen miktar her iki
                    programda da siparişlerden hesaplanır.
                  </p>
                </div>
              </div>
              <div className="kart-govde">
                <div className="karsilastirma">
                  <div className="ikincil kalin">Mevcut program</div>
                  <div className="ok" />
                  <div className="ikincil kalin" style={{ textAlign: "right" }}>
                    {aktifPlan.ad}
                  </div>
                </div>
                {farklar.map((f) => (
                  <div className="karsilastirma" key={f.etiket}>
                    <div>
                      <div className="ikincil">{f.etiket}</div>
                      <div className="sayisal">{f.mevcut}</div>
                    </div>
                    <div className="ok">→</div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="sayisal kalin"
                        style={{ color: f.iyi ? "var(--iyi)" : "var(--kritik)" }}
                      >
                        {f.yeni}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="vurgu-kutu" style={{ marginTop: 14 }}>
                  <b>
                    {kazanc >= 0 ? "Dönem kazancı" : "Dönem ek maliyeti"}:{" "}
                    {tl(Math.abs(kazanc))}
                  </b>{" "}
                  ({UFUK_GUN} gün). Buna ek olarak{" "}
                  {tlKisa(
                    mevcut.ihtiyacDisiSermayeTL - aktifPlan.ihtiyacDisiSermayeTL,
                  )}{" "}
                  işletme sermayesi ihtiyaç dışı üretime bağlanmıyor.
                </div>
              </div>
            </section>

            <section className="kart">
              <div className="kart-baslik">
                <div>
                  <h2>Programı uygulama</h2>
                  <p>
                    Onaylandığında program üretim, planlama ve satış için tek
                    kaynak olur; bugün telefonla dağıtılan bilgi yerine geçer.
                  </p>
                </div>
              </div>
              <div className="kart-govde">
                {onaylandi ? (
                  <div className="yigin">
                    <div className="vurgu-kutu">
                      <b>Program onaylandı.</b> {aktifPlan.ad} üretim hattına,
                      planlamaya ve satışa açıldı. Terminleri değişen siparişler
                      işaretlendi.
                    </div>
                    <ul className="ikincil" style={{ margin: 0, paddingLeft: 18 }}>
                      <li>
                        {aktifPlan.hatlar.reduce(
                          (t, h) => t + h.kampanyalar.length,
                          0,
                        )}{" "}
                        kampanya, toplam {ton(aktifPlan.uretilenTon)} üretim.
                      </li>
                      <li>
                        {aktifPlan.gecikenSiparis === 0
                          ? "Bütün siparişler termininde."
                          : `${aktifPlan.gecikenSiparis} siparişin termini için müşteriyle görüşülmesi gerekiyor.`}
                      </li>
                      <li>
                        Başarı ölçüsü: dönem sonunda geciken sipariş sayısı,
                        ürün geçiş saati ve ortalama stok gün kapsaması.
                      </li>
                    </ul>
                    <button className="dugme" onClick={onayiGeriAl}>
                      Onayı geri al
                    </button>
                  </div>
                ) : (
                  <div className="yigin">
                    <p className="ikincil" style={{ margin: 0 }}>
                      Aşağıdaki programda kampanyaların sırasını
                      değiştirebilirsiniz; rakamlar anında yeniden hesaplanır.
                      Uygun bulduğunuzda onaylayın.
                    </p>
                    <button className="dugme birincil" onClick={onayla}>
                      Bu programı onayla ve yayınla
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>{UFUK_GUN} günlük üretim programı</h2>
                <p>
                  Taralı kırmızı alanlar ürün geçişi (temizlik / yıkama) için
                  kaybedilen süredir.
                </p>
              </div>
              <Rozet tur="notr">{aktifPlan.ad}</Rozet>
            </div>
            <div className="kart-govde">
              <div className="gantt">
                {aktifPlan.hatlar.map((h) => {
                  const hat = HATLAR.find((x) => x.id === h.hat)!;
                  return (
                    <div className="gantt-hat" key={h.hat}>
                      <div className="gantt-hat-ad">
                        <strong>{hat.ad}</strong>
                        <span className="ikincil">
                          {yuzde(h.kapasiteKullanimi)} kullanım · {h.gecisSaati}{" "}
                          saat geçiş
                        </span>
                      </div>
                      <GanttCizgisi
                        kampanyalar={h.kampanyalar}
                        kisaAd={(sku) => urunBul(sku).kisaAd}
                      />
                    </div>
                  );
                })}
                <div className="gantt-eksen">
                  <span />
                  <div className="gantt-eksen-ic">
                    {[0, 7, 14, 21].map((g) => (
                      <span key={g}>{tarihKisa(gunuTariheCevir(g))}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>Kampanyalar ve gerekçeleri</h2>
                <p>
                  Ajan her kampanyayı neden o sıraya koyduğunu yazıyor. Sırayı
                  değiştirirseniz maliyet tablosu anında güncellenir.
                </p>
              </div>
            </div>
            <div className="kart-govde sikisik">
              <div className="tablo-sarmal">
                <table className="tablo">
                  <thead>
                    <tr>
                      <th>Hat</th>
                      <th>Ürün</th>
                      <th className="sayi">Miktar</th>
                      <th>Başlangıç</th>
                      <th>Bitiş</th>
                      <th>Gerekçe</th>
                      <th>Sıra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aktifPlan.hatlar.flatMap((h) =>
                      h.kampanyalar.map((k, i) => (
                        <tr key={`${h.hat}-${i}`}>
                          <td className="ikincil">
                            {HATLAR.find((x) => x.id === h.hat)!.ad}
                          </td>
                          <td>
                            <span className="satir" style={{ gap: 6 }}>
                              <span
                                style={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: 3,
                                  background: kampanyaRengi(k.sku),
                                  display: "inline-block",
                                }}
                              />
                              <span className="kalin">
                                {urunBul(k.sku).kisaAd}
                              </span>
                            </span>
                          </td>
                          <td className="sayi">{ton(k.ton)}</td>
                          <td>{tarihKisa(gunuTariheCevir(k.baslangicGun))}</td>
                          <td>{tarihKisa(gunuTariheCevir(k.bitisGun))}</td>
                          <td className="ikincil" style={{ maxWidth: 380 }}>
                            {k.gerekce}
                          </td>
                          <td>
                            <span className="satir" style={{ gap: 4 }}>
                              <button
                                className="dugme kucuk"
                                onClick={() => kampanyaTasi(h.hat as LineId, i, -1)}
                                disabled={i === 0}
                                aria-label="Yukarı taşı"
                              >
                                ↑
                              </button>
                              <button
                                className="dugme kucuk"
                                onClick={() => kampanyaTasi(h.hat as LineId, i, 1)}
                                disabled={i === h.kampanyalar.length - 1}
                                aria-label="Aşağı taşı"
                              >
                                ↓
                              </button>
                            </span>
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>Bütün bulgular</h2>
                <p>
                  {kosu.bulgular.length} bulgu; her birinin finansal etkisi
                  hesaplanmış durumda.
                </p>
              </div>
            </div>
            <div className="kart-govde">
              <div className="yigin">
                {kosu.bulgular.map((b) => (
                  <BulguKarti key={b.id} bulgu={b} />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

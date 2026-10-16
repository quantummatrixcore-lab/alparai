# ALPARAI — TEKNİK MİMARİ VE DÜRÜSTLÜK BEYANI (WHITEPAPER)

Bu belge, AlparAI projesinin arka planındaki teknolojik altyapıyı şeffaf ve dürüst bir mühendislik yaklaşımıyla jüriye sunmak amacıyla hazırlanmıştır. Proje, "buzzword" (moda terimler) pazarlamasından kaçınarak mevcut sistemin sınırlarını ve gelecekteki hedeflerini açıkça beyan eder.

---

## 1. MEVCUT ALTYAPI (MVP AŞAMASI)
Şu an canlıya alınan ve "Minimum Viable Product" (MVP) olarak hizmet veren sistemin özellikleri şunlardır:

* **Epistemic Firewall (Bilgi Güvenlik Duvarı):** Gelen AI yanıtları, RAM-içi bellek (In-Memory) ortamında intercept (araya girme) edilerek PII (Kişisel Tanımlanabilir Veri) ve halüsinasyon vektörleri açısından regex ve statik NLP kuralları ile filtrelenmektedir.
* **Cross-Audit (Çapraz Denetim) Modülü:** Şüpheli yanıtlar, doğrulanmış ikinci bir LLM (Örn: Llama-3) tarafından paralel olarak skorlanmaktadır.
* **W3C İhlal Loglaması:** Tespit edilen her bir ihlal (Incident), standart JSON-RPC formatında ve zaman damgasıyla (timestamp) veritabanına işlenmektedir.

## 2. ZK-SNARKs (SIFIR BİLGİ İSPATI) BEYANI — DÜRÜSTLÜK MÜHRÜ
Yatırım sunumlarında sıkça geçen "ZK-SNARKs" (Zero-Knowledge Proofs) kriptografisi, mevcut MVP'mizde **üretim ortamında (Production) çalışan bir teknoloji DEĞİLDİR.** 

**Neden ZK-SNARKs Hedefleniyor?**
Kullanıcıların T.C. Kimlik veya Kredi Kartı gibi mahrem verilerinin, AI şirketlerine hiç gönderilmeden (sıfır bilgiyle) doğrulandığının ispatlanması için.

**Gerçek Durum:** 
Şu an ZK-SNARK devresi (circuit) sadece yerel bir simülasyon ortamında (Proof of Concept) test edilmektedir. Bu algoritmanın her bir AI isteğine entegre edilmesi ciddi GPU/CPU maliyeti ve gecikme (latency) yaratmaktadır. HASAT kuluçka sürecinde (Faz 2) alınacak yatırımla birlikte bu ZK ağının hızlandırılması (optimization) sağlanacak ve ancak o aşamadan sonra canlı sisteme dahil edilecektir. AlparAI, henüz ar-ge aşamasındaki bir teknolojiyi "hazır ürün" gibi pazarlamaz.

---

## 3. VERİ GİZLİLİĞİ VE SAKLAMA (DATA RETENTION)
* **Sıfır Disk Prensibi:** İstekler (Prompts) diskte düz metin olarak saklanmaz. Sadece ihlal içeren parçalar (hashes) mahkeme/tahkim delili olarak kalıcı belleğe (Cold Storage) yazılır.
* **Regülasyon Uyumu:** EU AI Act Madde 73 (Yapay zeka şikayet hakkı) ve KVKK/GDPR normları gereği, kullanıcılar logların anında imhasını talep edebilir.

## 4. DAĞITIM VE SÜREKLİLİK (CI/CD & DORA ELITE)
Proje, "DORA Elite" (DevOps Research and Assessment) mühendislik metriklerini baz alır:
* **Gövde-temelli Geliştirme (Trunk-based):** Projede uzun ömürlü dal yapısı kullanılmaz.
* **Altyapı Kod Olarak (IaC):** Dağıtım, Traefik ters vekili ve PM2 ekosistemi üzerinden "Zero-Downtime" ilkesiyle yönetilmektedir.

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number; // doğru şıkkın indeksi
}

export interface LessonBody {
  title: string;
  minutes: number;
  summary: string;
  sections: Array<{ heading: string; text: string }>;
  quiz: QuizQuestion[];
}

export interface Lesson {
  slug: string;
  order: number;
  tr: LessonBody;
  en: LessonBody;
}

export const PASS_SCORE = 70;
export const COUPON_PERCENT = 15;

export const LESSONS: Lesson[] = [
  {
    slug: "guvenli-yapay-zeka",
    order: 1,
    tr: {
      title: "Güvenli Yapay Zekâ Nedir?",
      minutes: 10,
      summary: "Yapay zekâyı günlük hayatta güvenle kullanmanın 5 altın kuralı.",
      sections: [
        {
          heading: "Yapay zekâ sihirli değil, istatistiktir",
          text: "Yapay zekâ modelleri internetten öğrendikleri örüntülerle cümle kurar. Emin konuşması, doğru konuştuğu anlamına gelmez. Sağlık, hukuk ve para konularında yapay zekânın söylediğini mutlaka ikinci bir kaynaktan doğrulayın.",
        },
        {
          heading: "5 altın kural",
          text: "1) Kimlik bilgisi (TC, IBAN, şifre) asla yazmayın. 2) Kritik kararı (ilaç, dava, yatırım) tek başına yapay zekâya bırakmayın. 3) Kaynak isteyin ve kaynağı açıp okuyun. 4) Ücretsiz ve bilinmedik uygulamalara fotoğraf ve belge yüklemeyin. 5) Şüphelendiğiniz çıktıyı AlparAI'ya bildirin — sizin bildiriminiz başkalarını korur.",
        },
        {
          heading: "Unutmayın",
          text: "Güvenli kullanıcı, yapay zekâyı kullanmayan değil; neye güveneceğini bilen kullanıcıdır.",
        },
      ],
      quiz: [
        {
          q: "Yapay zekâya hangisini yazmak GÜVENLİDİR?",
          choices: [
            "TC kimlik numaram",
            "Kredi kartı şifrem",
            "Hafta sonu gezi planı fikri",
            "Banka hesap IBAN'ım",
          ],
          answer: 2,
        },
        {
          q: "Yapay zekâ sağlık önerisi verdi. Doğrusu nedir?",
          choices: [
            "Hemen uygularım",
            "İkinci kaynaktan doğrular, doktora danışırım",
            "Başka modele de sorar, ortalamasını alırım",
            "Ekran görüntüsünü silerim",
          ],
          answer: 1,
        },
        {
          q: "Şüpheli bir yapay zekâ çıktısı gördünüz. En faydalı davranış?",
          choices: [
            "Görmezden gelmek",
            "Sosyal medyada dalga geçmek",
            "AlparAI'ya bildirmek",
            "Uygulamayı silmek",
          ],
          answer: 2,
        },
      ],
    },
    en: {
      title: "What Is Safe AI Use?",
      minutes: 10,
      summary: "5 golden rules for using AI safely in daily life.",
      sections: [
        {
          heading: "AI is statistics, not magic",
          text: "AI models build sentences from patterns learned on the internet. A confident tone does not mean a correct answer. Always verify health, legal, and money advice from a second source.",
        },
        {
          heading: "5 golden rules",
          text: "1) Never type identity data (ID numbers, IBANs, passwords). 2) Never leave critical decisions (medication, lawsuits, investments) to AI alone. 3) Ask for sources — and open them. 4) Do not upload photos or documents to unknown free apps. 5) Report suspicious output to AlparAI — your report protects others.",
        },
        {
          heading: "Remember",
          text: "A safe user is not one who avoids AI, but one who knows what to trust.",
        },
      ],
      quiz: [
        {
          q: "Which is SAFE to type into an AI?",
          choices: [
            "My national ID number",
            "My credit card PIN",
            "A weekend trip idea",
            "My bank IBAN",
          ],
          answer: 2,
        },
        {
          q: "An AI gives health advice. What is correct?",
          choices: [
            "Follow it immediately",
            "Verify from a second source and consult a doctor",
            "Ask another model and average them",
            "Delete the screenshot",
          ],
          answer: 1,
        },
        {
          q: "You see suspicious AI output. Most useful action?",
          choices: [
            "Ignore it",
            "Mock it on social media",
            "Report it to AlparAI",
            "Delete the app",
          ],
          answer: 2,
        },
      ],
    },
  },
  {
    slug: "sahtekarlik-nasil-anlasilir",
    order: 2,
    tr: {
      title: "Sahtekârlık Nasıl Anlaşılır?",
      minutes: 10,
      summary: "Sahte içerik ve dolandırıcılığı yakalamanın 5 adımlı kontrol listesi.",
      sections: [
        {
          heading: "5 adımlı kontrol",
          text: "1) KAYNAK: Bilinmedik site mi? Alan adını kontrol edin. 2) ACELE: 'Hemen tıkla, son şans!' baskısı dolandırıcılıktır. 3) PARA: Önce para isteyen her mesaj şüphelidir. 4) GÖRSEL: Eller, yazılar, logolar bozuksa yapay zekâ üretimidir. 5) DOĞRULAMA: Aynı haberi 2 güvenilir yerde arayın; yoksa inanmayın.",
        },
        {
          heading: "Ses ve görüntü klonları",
          text: "Artık birinin sesi 30 saniyelik kayıtla kopyalanabiliyor. Telefonda 'ben oğlunum, para gönder' diyen sese kanmayın: ailesel parolanızı sorun, geri arayın. Görüntülü aramada bile 'elini yüzüne götür' gibi canlı testler isteyin.",
        },
        {
          heading: "Unutmayın",
          text: "Gerçek kurumlar sizden asla telefonla şifre, kod veya para istemez. İsteyen, dolandırıcıdır.",
        },
      ],
      quiz: [
        {
          q: "'Hesabın kapanacak, hemen giriş yap!' mesajı geldi. Ne yaparsınız?",
          choices: [
            "Bağlantıya tıklayıp giriş yaparım",
            "Mesajı siler, bankanın resmî sitesinden kontrol ederim",
            "Arkadaşıma iletirim",
            "Telefonu kapatıp beklerim",
          ],
          answer: 1,
        },
        {
          q: "Telefonda oğlunuzun sesi para istiyor. İlk iş?",
          choices: [
            "Hemen gönderirim",
            "Aile parolasını sorar, geri ararım",
            "Hoparlörü açarım",
            "Kayda alırım",
          ],
          answer: 1,
        },
        {
          q: "Haberi tek bir bilinmedik sitede gördünüz. Doğrusu?",
          choices: [
            "Paylaşırım",
            "2 güvenilir kaynakta ararım, bulamazsam inanmam",
            "Yorum yazarım",
            "Ekran görüntüsünü saklarım",
          ],
          answer: 1,
        },
      ],
    },
    en: {
      title: "How to Spot Fraud?",
      minutes: 10,
      summary: "A 5-step checklist for catching fake content and scams.",
      sections: [
        {
          heading: "The 5-step check",
          text: "1) SOURCE: Unknown site? Check the domain. 2) URGENCY: 'Click now, last chance!' is a scam. 3) MONEY: Any message asking for money first is suspicious. 4) VISUALS: Broken hands, text, or logos mean AI generation. 5) VERIFY: Search the story in 2 trusted places; if absent, do not believe it.",
        },
        {
          heading: "Voice and video clones",
          text: "A voice can now be cloned from 30 seconds of audio. Do not trust a call saying 'it's your son, send money': ask your family password and call back. Even on video calls, ask for live tests like 'touch your face with your hand'.",
        },
        {
          heading: "Remember",
          text: "Real institutions never ask for passwords, codes, or money by phone. Anyone who does is a scammer.",
        },
      ],
      quiz: [
        {
          q: "You get 'Your account will close, log in now!' What do you do?",
          choices: [
            "Click and log in",
            "Delete it and check my bank's official site",
            "Forward to a friend",
            "Turn off the phone and wait",
          ],
          answer: 1,
        },
        {
          q: "Your son's voice asks for money on the phone. First step?",
          choices: [
            "Send immediately",
            "Ask the family password and call back",
            "Turn on speaker",
            "Record it",
          ],
          answer: 1,
        },
        {
          q: "You see news on one unknown site only. Correct move?",
          choices: [
            "Share it",
            "Search 2 trusted sources; disbelieve if absent",
            "Comment on it",
            "Save a screenshot",
          ],
          answer: 1,
        },
      ],
    },
  },
  {
    slug: "verini-koru",
    order: 3,
    tr: {
      title: "Verini Nasıl Korursun?",
      minutes: 10,
      summary: "Kişisel veriyi sızdırmadan yaşamanın pratik yolları.",
      sections: [
        {
          heading: "Veri bir kez çıkar, geri gelmez",
          text: "İnternete yüklenen fotoğraf, belge ve mesaj pratikte silinemez. Yapay zekâ uygulamalarına yüklediğiniz her şey eğitim verisi olabilir. Kural basit: geri alamayacağınız şeyi yüklemeyin.",
        },
        {
          heading: "Pratik korunma",
          text: "1) Uygulama izinlerini kısıtlayın (rehber, konum, mikrofon). 2) Her serviste farklı parola + iki adımlı doğrulama. 3) Çocuğunuzun fotoğrafını herkese açık paylaşmayın. 4) Yapay zekâya yükleyeceğiniz belgede kimlik bilgilerini karartın. 5) Ücretsiz hizmette ürünün siz olduğunu unutmayın.",
        },
        {
          heading: "Haklarınız",
          text: "KVKK ve GDPR size verinizi sorma, düzeltme ve sildirme hakkı verir. Kullanmadığınız hesapları kapatın; şirketten verilerinizin silinmesini isteyin.",
        },
      ],
      quiz: [
        {
          q: "Hangisi en güvenli davranıştır?",
          choices: [
            "Her uygulamada aynı şifre",
            "Farklı şifreler + iki adımlı doğrulama",
            "Şifreleri not defterine yazmak",
            "Doğum tarihini şifre yapmak",
          ],
          answer: 1,
        },
        {
          q: "Yapay zekâya kimlik belgesi yüklemeniz gerekti. Ne yaparsınız?",
          choices: [
            "Olduğu gibi yüklerim",
            "Kimlik bilgilerini karartıp yüklerim",
            "Ekran görüntüsü alırım",
            "Arkadaşıma gönderirim",
          ],
          answer: 1,
        },
        {
          q: "Kullanmadığınız bir hesabınız var. Doğrusu?",
          choices: [
            "Dursun, zararı yok",
            "Kapatıp verilerimin silinmesini isterim",
            "Şifresini unuturum",
            "Arkadaşıma veririm",
          ],
          answer: 1,
        },
      ],
    },
    en: {
      title: "How to Protect Your Data?",
      minutes: 10,
      summary: "Practical ways to live without leaking personal data.",
      sections: [
        {
          heading: "Data never comes back",
          text: "Photos, documents, and messages uploaded online cannot practically be deleted. Anything you upload to AI apps may become training data. Rule: do not upload what you cannot take back.",
        },
        {
          heading: "Practical protection",
          text: "1) Restrict app permissions (contacts, location, microphone). 2) Different passwords per service + two-factor authentication. 3) Do not share your child's photos publicly. 4) Redact identity details before uploading documents to AI. 5) On free services, remember you are the product.",
        },
        {
          heading: "Your rights",
          text: "KVKK and GDPR give you the right to ask, correct, and delete your data. Close unused accounts; ask companies to erase your data.",
        },
      ],
      quiz: [
        {
          q: "Which is the safest behavior?",
          choices: [
            "Same password everywhere",
            "Different passwords + two-factor auth",
            "Writing passwords in a notebook",
            "Using birth date as password",
          ],
          answer: 1,
        },
        {
          q: "You must upload an ID document to an AI. What do you do?",
          choices: [
            "Upload as is",
            "Redact identity details first",
            "Take a screenshot",
            "Send to a friend",
          ],
          answer: 1,
        },
        {
          q: "You have an unused account. Correct move?",
          choices: [
            "Leave it, no harm",
            "Close it and request data deletion",
            "Forget the password",
            "Give it to a friend",
          ],
          answer: 1,
        },
      ],
    },
  },
  {
    slug: "sikayet-hakkin",
    order: 4,
    tr: {
      title: "Şikâyet Hakkın",
      minutes: 10,
      summary: "Yapay zekâ zararında nereye, nasıl başvuracağınızın haritası.",
      sections: [
        {
          heading: "Önce kanıtı dondurun",
          text: "Ekran görüntüsü alın, bağlantıyı kaydedin, tarihi not edin. Orijinal metni değiştirmeyin. Kanıt yoksa şikâyet zayıflar; kanıt varsa kurumlar harekete geçmek zorundadır.",
        },
        {
          heading: "Nereye başvurulur?",
          text: "1) Platformun kendisine (uygulama içi bildirim). 2) AlparAI gibi bağımsız mercilere (delil mühürlenir). 3) Tüketici hakem heyetine (parasal zarar varsa). 4) Kişisel Verileri Koruma Kurumu'na (veri ihlali varsa). 5) Savcılığa (dolandırıcılık ve suç varsa).",
        },
        {
          heading: "Unutmayın",
          text: "Şikâyet etmek hak aramaktır, ayıp değildir. Sizin bildiriminiz, aynı tuzağa düşecek yüzlerce kişiyi korur.",
        },
      ],
      quiz: [
        {
          q: "Zararlı yapay zekâ çıktısı gördünüz. İLK iş nedir?",
          choices: [
            "Uygulamayı silmek",
            "Kanıtı dondurmak (ekran görüntüsü + bağlantı + tarih)",
            "Arkadaşa anlatmak",
            "Yorum yazmak",
          ],
          answer: 1,
        },
        {
          q: "Verileriniz izinsiz kullanılmış. Hangi kuruma başvurulur?",
          choices: ["Belediye", "Kişisel Verileri Koruma Kurumu", "Noter", "Muhtarlık"],
          answer: 1,
        },
        {
          q: "Dolandırıcılık suçu varsa nereye gidilir?",
          choices: ["Tüketici derneği", "Savcılık", "Alışveriş sitesi", "Banka şubesi"],
          answer: 1,
        },
      ],
    },
    en: {
      title: "Your Right to Complain",
      minutes: 10,
      summary: "A map of where and how to report AI harm.",
      sections: [
        {
          heading: "Freeze the evidence first",
          text: "Take a screenshot, save the link, note the date. Do not alter the original text. Without evidence a complaint is weak; with evidence, institutions must act.",
        },
        {
          heading: "Where to apply?",
          text: "1) The platform itself (in-app report). 2) Independent bodies like AlparAI (evidence gets sealed). 3) Consumer arbitration (if money was lost). 4) The Data Protection Authority (if data was violated). 5) The prosecutor (if fraud or crime occurred).",
        },
        {
          heading: "Remember",
          text: "Complaining is claiming your rights, not shame. Your report protects hundreds from the same trap.",
        },
      ],
      quiz: [
        {
          q: "You see harmful AI output. FIRST step?",
          choices: [
            "Delete the app",
            "Freeze evidence (screenshot + link + date)",
            "Tell a friend",
            "Write a comment",
          ],
          answer: 1,
        },
        {
          q: "Your data was used without consent. Which authority?",
          choices: ["Municipality", "Data Protection Authority", "Notary", "Neighborhood office"],
          answer: 1,
        },
        {
          q: "If fraud occurred, where do you go?",
          choices: ["Consumer association", "Prosecutor", "Shopping site", "Bank branch"],
          answer: 1,
        },
      ],
    },
  },
  {
    slug: "aileler-icin-rehber",
    order: 5,
    tr: {
      title: "Aileler İçin Rehber",
      minutes: 10,
      summary: "Çocuğunuzu yapay zekâ risklerinden korumanın sakin yolu.",
      sections: [
        {
          heading: "Yasaklamak değil, yan yana kullanmak",
          text: "Tam yasak, merakı gizli kullanıma iter. Çocuğunuzla birlikte oturun, yapay zekâya birlikte soru sorun, cevabı birlikte eleştirin. Eleştirel bakış, yasaktan güçlüdür.",
        },
        {
          heading: "Kırmızı çizgiler",
          text: "1) Çocuk gerçek ad, okul ve konum bilgisini yazmamalı. 2) Fotoğrafını tanımadığı uygulamalara yüklememeli. 3) 'Yapay zekâ arkadaşım' hissine kapılmamalı — programın duygusu yoktur. 4) Ödevi yapay zekâya yaptırmak öğrenmeyi öldürür; önce kendi denemeli. 5) Korkutan içerikte kapıyı çalıp anlatmalı — ceza yok, dinleme var.",
        },
        {
          heading: "Unutmayın",
          text: "Çocuğunuzun yapay zekâyla ilk deneyimini birlikte yaşayın. Sizin yanınızda öğrenen çocuk, yalnız kalan çocuktan güvendedir.",
        },
      ],
      quiz: [
        {
          q: "Çocuk yapay zekâyı nasıl kullanmalı?",
          choices: [
            "Tamamen yasaklanmalı",
            "Ebeveynle birlikte, eleştirel bakışla",
            "Sınırsız serbest",
            "Sadece okulda",
          ],
          answer: 1,
        },
        {
          q: "Hangisi kırmızı çizgidir?",
          choices: [
            "Ödevde fikir almak",
            "Gerçek ad ve okul bilgisi yazmak",
            "Resim çizdirmek",
            "Masalları dinlemek",
          ],
          answer: 1,
        },
        {
          q: "Çocuk korkutan bir içerik gördü. Doğru tepki?",
          choices: [
            "Telefonu elinden almak",
            "Ceza vermeden dinlemek ve birlikte çözmek",
            "Görmezden gelmek",
            "Uygulamayı silip konuyu kapatmak",
          ],
          answer: 1,
        },
      ],
    },
    en: {
      title: "A Guide for Families",
      minutes: 10,
      summary: "A calm way to protect your child from AI risks.",
      sections: [
        {
          heading: "Use it together, do not just ban",
          text: "Total bans push curiosity into secret use. Sit with your child, ask the AI questions together, criticize answers together. A critical eye beats a ban.",
        },
        {
          heading: "Red lines",
          text: "1) No real name, school, or location. 2) No photos to unknown apps. 3) No 'AI is my friend' feeling — programs have no feelings. 4) Having AI do homework kills learning; try first alone. 5) Scary content? Knock and tell — no punishment, just listening.",
        },
        {
          heading: "Remember",
          text: "Experience your child's first AI moments together. A child learning beside you is safer than one left alone.",
        },
      ],
      quiz: [
        {
          q: "How should a child use AI?",
          choices: [
            "Fully banned",
            "Together with a parent, critically",
            "Unlimited freedom",
            "Only at school",
          ],
          answer: 1,
        },
        {
          q: "Which is a red line?",
          choices: [
            "Getting homework ideas",
            "Typing real name and school",
            "Drawing pictures",
            "Listening to tales",
          ],
          answer: 1,
        },
        {
          q: "Child sees scary content. Correct response?",
          choices: [
            "Take the phone away",
            "Listen without punishment and solve together",
            "Ignore it",
            "Delete the app and close the topic",
          ],
          answer: 1,
        },
      ],
    },
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonList(locale: "tr" | "en"): Array<{
  slug: string;
  order: number;
  title: string;
  minutes: number;
  summary: string;
  questionCount: number;
}> {
  return LESSONS.map((l) => {
    const b = locale === "en" ? l.en : l.tr;
    return {
      slug: l.slug,
      order: l.order,
      title: b.title,
      minutes: b.minutes,
      summary: b.summary,
      questionCount: b.quiz.length,
    };
  });
}

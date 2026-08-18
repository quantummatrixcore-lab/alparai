const fs = require("fs");

const dmcaModerationKeys = {
  en: {
    dmcaTitle: "DMCA Notice and Takedown Policy",
    dmcaDesc: "Information about copyright infringement claims.",
    dmcaNoticeTitle: "Notice of Infringement",
    dmcaNotice:
      "To file a copyright infringement notification with us, you will need to send a written communication that includes substantially the following:",
    dmcaNotice1:
      "A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.",
    dmcaNotice2: "Identification of the copyrighted work claimed to have been infringed.",
    dmcaNotice3:
      "Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material.",
    dmcaNotice4:
      "Information reasonably sufficient to permit us to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted.",
    dmcaNotice5:
      "A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.",
    dmcaNotice6:
      "A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.",
    dmcaContactTitle: "Designated Contact",
    dmcaContact: "Please contact our Designated Agent at: legal@alparai.com",
    dmcaCounterTitle: "Counter-Notice Procedure",
    dmcaCounter:
      "If you believe that your content was removed or disabled by mistake or misidentification, you may send us a counter-notice. It must include your signature, identification of the material removed, a statement under penalty of perjury, and your contact information.",
    dmcaTimelinesTitle: "Timelines",
    dmcaTimelines:
      "We will process valid notices and take necessary actions in a timely manner according to applicable law.",
    modTitle: "Content Moderation Policy",
    modDesc: "How ALPAR AI moderates third-party allegations.",
    modPublishedTitle: "What gets published",
    modPublished:
      "We publish verified incidents involving AI systems that are factually documented and substantiated. Content must adhere to our terms of service and not contain unverified defamatory claims.",
    modRejectedTitle: "What gets rejected",
    modRejected:
      "We reject spam, completely unsubstantiated claims, non-AI related incidents, hate speech, doxxing, or content violating our community guidelines.",
    modWhoTitle: "Who decides",
    modWho:
      "Our moderation team, consisting of trained human moderators, reviews incidents before publication.",
    modAppealTitle: "How to appeal",
    modAppeal:
      "Currently, no moderator UI exists to automatically resolve appeals. If your report was rejected (e.g. marked as 'rejected' in our system), you will receive a notification email detailing the decision. You can contact us for a manual review by replying to that email, but please note that the automated appeal pipeline is still under development.",
  },
  tr: {
    dmcaTitle: "DMCA Bildirim ve Kaldırma Politikası",
    dmcaDesc: "Telif hakkı ihlali iddiaları hakkında bilgi.",
    dmcaNoticeTitle: "İhlal Bildirimi",
    dmcaNotice:
      "Bize bir telif hakkı ihlali bildirimi göndermek için, büyük ölçüde aşağıdakileri içeren yazılı bir iletişim göndermeniz gerekecektir:",
    dmcaNotice1:
      "İhlal edildiği iddia edilen münhasır hakkın sahibi adına hareket etmeye yetkili bir kişinin fiziksel veya elektronik imzası.",
    dmcaNotice2: "İhlal edildiği iddia edilen telif hakkı alınmış eserin tanımlanması.",
    dmcaNotice3:
      "İhlal ettiği veya ihlal faaliyetine konu olduğu iddia edilen ve kaldırılacak veya erişimi engellenecek materyalin tanımlanması ve materyali bulmamıza izin vermek için makul ölçüde yeterli bilgi.",
    dmcaNotice4:
      "Şikayetçi tarafla iletişim kurmamıza izin vermek için makul ölçüde yeterli olan adres, telefon numarası ve varsa e-posta adresi gibi bilgiler.",
    dmcaNotice5:
      "Şikayetçi tarafın, materyalin şikayet edilen şekilde kullanımının telif hakkı sahibi, aracısı veya yasa tarafından yetkilendirilmediğine iyi niyetle inandığına dair bir beyan.",
    dmcaNotice6:
      "Bildirimdeki bilgilerin doğru olduğuna ve yalan yere yemin etme cezası altında şikayetçi tarafın ihlal edildiği iddia edilen münhasır hakkın sahibi adına hareket etmeye yetkili olduğuna dair bir beyan.",
    dmcaContactTitle: "Belirlenmiş Temsilci",
    dmcaContact: "Lütfen Belirlenmiş Temsilcimizle şu adresten iletişime geçin: legal@alparai.com",
    dmcaCounterTitle: "Karşı Bildirim Prosedürü",
    dmcaCounter:
      "İçeriğinizin bir hata veya yanlış tanımlama sonucu kaldırıldığına veya engellendiğine inanıyorsanız, bize bir karşı bildirim gönderebilirsiniz. İmzanızı, kaldırılan materyalin tanımlanmasını, yalan yere yemin etme cezası altında bir beyanı ve iletişim bilgilerinizi içermelidir.",
    dmcaTimelinesTitle: "Zaman Çizelgeleri",
    dmcaTimelines:
      "Geçerli bildirimleri işleyecek ve yürürlükteki yasalara göre zamanında gerekli işlemleri yapacağız.",
    modTitle: "İçerik Moderasyon Politikası",
    modDesc: "ALPAR AI, üçüncü taraf iddialarını nasıl denetler.",
    modPublishedTitle: "Neler yayınlanır",
    modPublished:
      "Gerçeklere dayalı olarak belgelenmiş ve doğrulanmış yapay zeka sistemlerini içeren doğrulanmış olayları yayınlıyoruz. İçerik hizmet şartlarımıza uymalı ve doğrulanmamış iftira niteliğinde iddialar içermemelidir.",
    modRejectedTitle: "Neler reddedilir",
    modRejected:
      "Spam, tamamen asılsız iddialar, yapay zeka ile ilgili olmayan olaylar, nefret söylemi, kişisel bilgileri ifşa etme (doxxing) veya topluluk kurallarımızı ihlal eden içerikleri reddediyoruz.",
    modWhoTitle: "Kim karar verir",
    modWho:
      "Eğitimli insan moderatörlerden oluşan moderasyon ekibimiz olayları yayınlanmadan önce inceler.",
    modAppealTitle: "Nasıl itiraz edilir",
    modAppeal:
      "Şu anda, itirazları otomatik olarak çözecek bir moderatör arayüzü bulunmamaktadır. Raporunuz reddedilirse (örneğin sistemimizde 'rejected' olarak işaretlenirse), kararı detaylandıran bir bildirim e-postası alırsınız. Bu e-postayı yanıtlayarak manuel inceleme için bizimle iletişime geçebilirsiniz, ancak otomatik itiraz sürecinin hala geliştirme aşamasında olduğunu lütfen unutmayın.",
  },
  de: {
    dmcaTitle: "DMCA Notice-and-Takedown-Richtlinie",
    dmcaDesc: "Informationen zu Urheberrechtsverletzungsansprüchen.",
    dmcaNoticeTitle: "Benachrichtigung über Rechtsverletzungen",
    dmcaNotice:
      "Um eine Urheberrechtsverletzungsbenachrichtigung bei uns einzureichen, müssen Sie eine schriftliche Mitteilung senden, die im Wesentlichen Folgendes enthält:",
    dmcaNotice1:
      "Eine physische oder elektronische Unterschrift einer Person, die befugt ist, im Namen des Inhabers eines exklusiven Rechts zu handeln, das angeblich verletzt wird.",
    dmcaNotice2:
      "Identifizierung des urheberrechtlich geschützten Werks, das angeblich verletzt wurde.",
    dmcaNotice3:
      "Identifizierung des Materials, das angeblich eine Rechtsverletzung darstellt oder Gegenstand rechtsverletzender Aktivitäten ist und das entfernt werden soll oder auf das der Zugriff gesperrt werden soll, sowie Informationen, die ausreichen, um uns das Auffinden des Materials zu ermöglichen.",
    dmcaNotice4:
      "Informationen, die ausreichen, um uns die Kontaktaufnahme mit der beschwerdeführenden Partei zu ermöglichen, wie Adresse, Telefonnummer und, falls verfügbar, eine E-Mail-Adresse.",
    dmcaNotice5:
      "Eine Erklärung, dass die beschwerdeführende Partei in gutem Glauben davon ausgeht, dass die Verwendung des Materials in der beanstandeten Weise nicht vom Urheberrechtsinhaber, seinem Vertreter oder vom Gesetz genehmigt ist.",
    dmcaNotice6:
      "Eine Erklärung, dass die Informationen in der Benachrichtigung korrekt sind, und unter Strafe des Meineids, dass die beschwerdeführende Partei befugt ist, im Namen des Inhabers eines exklusiven Rechts zu handeln, das angeblich verletzt wird.",
    dmcaContactTitle: "Benannter Vertreter",
    dmcaContact: "Bitte kontaktieren Sie unseren benannten Vertreter unter: legal@alparai.com",
    dmcaCounterTitle: "Gegenbenachrichtigungsverfahren",
    dmcaCounter:
      "Wenn Sie der Meinung sind, dass Ihre Inhalte irrtümlich oder durch eine falsche Identifizierung entfernt oder gesperrt wurden, können Sie uns eine Gegenbenachrichtigung senden. Sie muss Ihre Unterschrift, die Identifizierung des entfernten Materials, eine Erklärung unter Androhung einer Meineidsstrafe und Ihre Kontaktinformationen enthalten.",
    dmcaTimelinesTitle: "Fristen",
    dmcaTimelines:
      "Wir werden gültige Benachrichtigungen bearbeiten und rechtzeitig gemäß geltendem Recht die erforderlichen Maßnahmen ergreifen.",
    modTitle: "Inhaltsmoderationsrichtlinie",
    modDesc: "Wie ALPAR AI Behauptungen Dritter moderiert.",
    modPublishedTitle: "Was veröffentlicht wird",
    modPublished:
      "Wir veröffentlichen verifizierte Vorfälle mit KI-Systemen, die sachlich dokumentiert und belegt sind. Der Inhalt muss unseren Nutzungsbedingungen entsprechen und darf keine unbestätigten diffamierenden Behauptungen enthalten.",
    modRejectedTitle: "Was abgelehnt wird",
    modRejected:
      "Wir lehnen Spam, völlig unbegründete Behauptungen, Vorfälle ohne KI-Bezug, Hassreden, Doxxing oder Inhalte ab, die gegen unsere Community-Richtlinien verstoßen.",
    modWhoTitle: "Wer entscheidet",
    modWho:
      "Unser Moderationsteam, das aus geschulten menschlichen Moderatoren besteht, überprüft Vorfälle vor der Veröffentlichung.",
    modAppealTitle: "Wie man Einspruch einlegt",
    modAppeal:
      "Derzeit gibt es keine Moderatoren-Benutzeroberfläche zur automatischen Bearbeitung von Einsprüchen. Wenn Ihr Bericht abgelehnt wurde (z.B. in unserem System als 'rejected' markiert), erhalten Sie eine Benachrichtigungs-E-Mail. Sie können auf diese E-Mail antworten, um eine manuelle Überprüfung anzufordern, aber bitte beachten Sie, dass die automatisierte Einspruchs-Pipeline noch in der Entwicklung ist.",
  },
  fr: {
    dmcaTitle: "Politique DMCA de notification et de retrait",
    dmcaDesc: "Informations sur les réclamations pour violation du droit d'auteur.",
    dmcaNoticeTitle: "Avis de violation",
    dmcaNotice:
      "Pour déposer une notification de violation de droit d'auteur auprès de nous, vous devrez envoyer une communication écrite qui comprend substantiellement ce qui suit :",
    dmcaNotice1:
      "Une signature physique ou électronique d'une personne autorisée à agir au nom du propriétaire d'un droit exclusif qui aurait été violé.",
    dmcaNotice2: "Identification de l'œuvre protégée par le droit d'auteur prétendument violée.",
    dmcaNotice3:
      "Identification du matériel prétendument en infraction ou sujet à une activité contrefaisante et qui doit être supprimé ou dont l'accès doit être désactivé, et des informations raisonnablement suffisantes pour nous permettre de localiser le matériel.",
    dmcaNotice4:
      "Des informations raisonnablement suffisantes pour nous permettre de contacter la partie plaignante, telles qu'une adresse, un numéro de téléphone et, si disponible, une adresse e-mail.",
    dmcaNotice5:
      "Une déclaration selon laquelle la partie plaignante croit de bonne foi que l'utilisation du matériel de la manière reprochée n'est pas autorisée par le titulaire du droit d'auteur, son agent ou la loi.",
    dmcaNotice6:
      "Une déclaration selon laquelle les informations contenues dans la notification sont exactes, et sous peine de parjure, que la partie plaignante est autorisée à agir au nom du propriétaire d'un droit exclusif prétendument violé.",
    dmcaContactTitle: "Agent désigné",
    dmcaContact: "Veuillez contacter notre agent désigné à : legal@alparai.com",
    dmcaCounterTitle: "Procédure de contre-notification",
    dmcaCounter:
      "Si vous pensez que votre contenu a été supprimé ou désactivé par erreur ou par mauvaise identification, vous pouvez nous envoyer une contre-notification. Elle doit inclure votre signature, l'identification du matériel supprimé, une déclaration sous peine de parjure et vos coordonnées.",
    dmcaTimelinesTitle: "Délais",
    dmcaTimelines:
      "Nous traiterons les avis valides et prendrons les mesures nécessaires en temps opportun, conformément à la loi applicable.",
    modTitle: "Politique de modération de contenu",
    modDesc: "Comment ALPAR AI modère les allégations de tiers.",
    modPublishedTitle: "Ce qui est publié",
    modPublished:
      "Nous publions des incidents vérifiés impliquant des systèmes d'IA qui sont documentés et justifiés factuellement. Le contenu doit respecter nos conditions de service et ne pas contenir d'allégations diffamatoires non vérifiées.",
    modRejectedTitle: "Ce qui est rejeté",
    modRejected:
      "Nous rejetons le spam, les allégations totalement non fondées, les incidents non liés à l'IA, les discours de haine, le doxxing ou le contenu violant nos directives communautaires.",
    modWhoTitle: "Qui décide",
    modWho:
      "Notre équipe de modération, composée de modérateurs humains formés, examine les incidents avant publication.",
    modAppealTitle: "Comment faire appel",
    modAppeal:
      "Actuellement, aucune interface utilisateur de modérateur n'existe pour résoudre automatiquement les appels. Si votre rapport a été rejeté (par exemple, marqué comme 'rejected' dans notre système), vous recevrez un e-mail de notification. Vous pouvez répondre à cet e-mail pour demander un examen manuel, mais veuillez noter que le processus d'appel automatisé est encore en cours de développement.",
  },
  ru: {
    dmcaTitle: "Политика DMCA об уведомлении и удалении",
    dmcaDesc: "Информация о претензиях в отношении нарушения авторских прав.",
    dmcaNoticeTitle: "Уведомление о нарушении",
    dmcaNotice:
      "Чтобы подать нам уведомление о нарушении авторских прав, вам необходимо направить письменное сообщение, которое в основном включает следующее:",
    dmcaNotice1:
      "Физическая или электронная подпись лица, уполномоченного действовать от имени владельца эксклюзивного права, которое предположительно было нарушено.",
    dmcaNotice2:
      "Идентификация защищенной авторским правом работы, которая предположительно была нарушена.",
    dmcaNotice3:
      "Идентификация материала, который, как утверждается, нарушает авторские права или является предметом нарушающей деятельности и который должен быть удален, или доступ к которому должен быть закрыт, и информация, достаточно достаточная, чтобы позволить нам найти этот материал.",
    dmcaNotice4:
      "Информация, достаточная для того, чтобы позволить нам связаться с жалующейся стороной, такая как адрес, номер телефона и, если доступно, адрес электронной почты.",
    dmcaNotice5:
      "Заявление о том, что жалующаяся сторона добросовестно полагает, что использование материала способом, на который подана жалоба, не разрешено владельцем авторских прав, его агентом или законом.",
    dmcaNotice6:
      "Заявление о том, что информация в уведомлении является точной, и под страхом наказания за лжесвидетельство, что жалующаяся сторона уполномочена действовать от имени владельца эксклюзивного права, которое предположительно было нарушено.",
    dmcaContactTitle: "Назначенный агент",
    dmcaContact: "Пожалуйста, свяжитесь с нашим назначенным агентом по адресу: legal@alparai.com",
    dmcaCounterTitle: "Процедура встречного уведомления",
    dmcaCounter:
      "Если вы считаете, что ваш контент был удален или отключен по ошибке или в результате неправильной идентификации, вы можете отправить нам встречное уведомление. Оно должно включать вашу подпись, идентификацию удаленного материала, заявление под страхом наказания за лжесвидетельство и вашу контактную информацию.",
    dmcaTimelinesTitle: "Сроки",
    dmcaTimelines:
      "Мы будем обрабатывать действительные уведомления и принимать необходимые меры своевременно в соответствии с применимым законодательством.",
    modTitle: "Политика модерации контента",
    modDesc: "Как ALPAR AI модерирует заявления третьих лиц.",
    modPublishedTitle: "Что публикуется",
    modPublished:
      "Мы публикуем проверенные инциденты, связанные с системами ИИ, которые документально подтверждены и обоснованы. Контент должен соответствовать нашим условиям обслуживания и не содержать непроверенных клеветнических заявлений.",
    modRejectedTitle: "Что отклоняется",
    modRejected:
      "Мы отклоняем спам, полностью необоснованные заявления, инциденты, не связанные с ИИ, разжигание ненависти, доксинг или контент, нарушающий наши правила сообщества.",
    modWhoTitle: "Кто принимает решение",
    modWho:
      "Наша команда модераторов, состоящая из обученных модераторов-людей, проверяет инциденты перед публикацией.",
    modAppealTitle: "Как подать апелляцию",
    modAppeal:
      "В настоящее время не существует пользовательского интерфейса для автоматического разрешения апелляций. Если ваш отчет был отклонен (например, помечен как 'rejected' в нашей системе), вы получите уведомление по электронной почте. Вы можете ответить на это письмо, чтобы запросить ручную проверку, но обратите внимание, что автоматизированная система апелляций все еще находится в стадии разработки.",
  },
};

for (const lang of ["en", "tr", "de", "fr", "ru"]) {
  const filePath = `./messages/${lang}.json`;
  let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.legal) data.legal = {};
  for (const [k, v] of Object.entries(dmcaModerationKeys[lang])) {
    data.legal[k] = v;
  }

  const sortObject = (obj) => {
    return Object.keys(obj)
      .sort()
      .reduce((res, key) => {
        res[key] =
          typeof obj[key] === "object" && !Array.isArray(obj[key])
            ? sortObject(obj[key])
            : obj[key];
        return res;
      }, {});
  };

  fs.writeFileSync(filePath, JSON.stringify(sortObject(data), null, 2) + "\\n");
}
console.log("Done updating translations!");

// SERVER-ONLY. Kessler Workshop — v2 facts (notebook chips). One sentence each; a time makes a time chip.
import type { FactDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const facts: FactDef[] = [
  // ── briefing
  { id: 'f-fobs', text: L('Both doors log every fob entry; staff carry personal fobs.', 'İki kapı da her kart girişini kaydediyor; çalışanların kişisel kartları var.') },
  { id: 'f-camera', text: L('Every car entering Brenner Lane passes the Ostwall camera.', 'Brenner Sokağı’na giren her araba Ostwall kamerasından geçiyor.') },

  // ── neighbour
  { id: 'f-shout-2200', text: L('A woman was heard shouting in the workshop around 22:00.', '22:00 sularında atölyede bir kadının bağırdığı duyuldu.'), time: '22:00' },
  { id: 'f-thump-2320', text: L('A heavy thump came from the workshop just after the 23:15 news began.', '23:15 haberleri başladıktan hemen sonra atölyeden ağır bir gümleme geldi.'), time: '23:20' },

  // ── workshop scene
  { id: 'f-wound-left', text: L('A single wound above the left ear, with little blood.', 'Sol kulağın üstünde tek bir yara; az kan var.'), about: ['p-thomas'] },
  { id: 'f-glasses', text: L('His reading glasses were folded on the bench, not on him.', 'Okuma gözlüğü üstünde değil, tezgâhta katlı duruyordu.'), about: ['p-thomas'] },
  { id: 'f-hands-clean', text: L('No grazes on his palms or wrists — suggestive, not proof.', 'Avuçlarında ve bileklerinde sıyrık yok — düşündürücü, ama kanıt değil.'), about: ['p-thomas'] },
  { id: 'f-dust-unbroken', text: L('The dust on the top shelves is unbroken. Did he climb at all? Powder on the rungs would say.', 'En üst raflardaki toz hiç bozulmamış. Merdivene hiç çıktı mı? Basamaklara toz sürmek bunu söyler.') },
  { id: 'f-rungs-clean', text: L('There are no prints on the upper rungs of the ladder.', 'Merdivenin üst basamaklarında hiç iz yok.') },
  { id: 'f-mallet-crooked', text: L('The heaviest mallet hangs crooked and is cleaner than the rest.', 'En ağır tokmak yamuk asılı ve ötekilerden temiz.') },
  { id: 'f-peg-wiped', text: L('The peg of the heaviest mallet has been wiped; every other peg is dusty.', 'En ağır tokmağın askısı silinmiş; öteki askıların hepsi tozlu.') },
  { id: 'f-lamp-on', text: L('The UV lamp was still on, aimed at an empty instrument cradle.', 'UV lambası hâlâ açıktı, boş bir çalgı beşiğine çevriliydi.') },
  { id: 'f-mirror', text: L('An inspection mirror lay by the lamp — the kind used to read brands inside an instrument.', 'Lambanın yanında bir inceleme aynası vardı — çalgının içindeki damgayı okumaya yarayan türden.') },
  { id: 'f-earring-fresh', text: L('The earring back lies on top of the shavings, free of dust.', 'Küpe arkalığı talaşların üstünde, tozsuz duruyor.') },
  { id: 'f-rag-damp', text: L('A rag in the bin is still damp with naphtha.', 'Kovadaki bir bez hâlâ neftle nemli.') },
  { id: 'f-bow-missing', text: L('A Sartory bow worth €18,500 is missing from the cabinet.', 'Vitrinden 18.500 € değerinde bir Sartory yay eksik.') },

  // ── office, vault, courtyard
  { id: 'f-loan', text: L('A €900,000 loan was settled on 4 September with no source shown.', '900.000 €’luk bir kredi 4 Eylül’de kapanmış; paranın kaynağı yazmıyor.'), about: ['clara'] },
  { id: 'f-varnish-even', text: L('Under UV the varnish of the vault violin glows evenly, with no old layers.', 'Kasadaki kemanın verniği UV’de düz ışıyor, eski katman yok.') },
  { id: 'f-bike-tracks', text: L('One bicycle came and went after the frost formed.', 'Kırağı düştükten sonra bir bisiklet gelip gitmiş.'), about: ['leo'] },

  // ── documents
  { id: 'f-note-varnish', text: L('Thomas noted that the varnish looked wrong under UV.', 'Thomas, UV’de verniğin yanlış göründüğünü not etmiş.'), about: ['p-thomas'] },
  { id: 'f-note-jf', text: L('Thomas found the brand “JF” inside the violin.', 'Thomas kemanın içinde “JF” damgasını bulmuş.'), about: ['p-thomas', 'jonas'] },
  { id: 'f-note-then-c', text: L('Thomas meant to ask J. first, then C.', 'Thomas önce J.’ye, sonra C.’ye sormayı planlamış.'), about: ['jonas', 'clara'] },
  { id: 'f-diary-bank', text: L('Thomas’s diary: “11:30 Bank?? (C.)”.', 'Thomas’ın ajandası: “11:30 Banka?? (C.)”.'), about: ['clara'] },
  { id: 'f-diary-miriam', text: L('Thomas expected M.A. at 21:45 to show her the Guadagnini.', 'Thomas 21:45’te M.A.’yı bekliyormuş; Guadagnini’yi gösterecekmiş.'), time: '21:45', about: ['miriam'] },
  { id: 'f-notice', text: L('Miriam gave notice on 4 March; Thomas would not release the violin before 3 April.', 'Miriam 4 Mart’ta geri çekme bildirimi vermiş; Thomas kemanı 3 Nisan’dan önce vermeyecekmiş.'), about: ['miriam'] },
  { id: 'f-ledger-noin', text: L('The violin was signed out at 21:40 and never signed back in.', 'Keman 21:40’ta kasadan çıkarılmış, dönüşü hiç yazılmamış.'), time: '21:40' },
  { id: 'f-single-blow', text: L('Death was caused by a single blow from a round face about 42 mm wide.', 'Ölüme yaklaşık 42 mm genişliğinde, yuvarlak yüzlü bir cisimle indirilen tek darbe yol açtı.') },
  { id: 'f-no-fall', text: L('There are no injuries consistent with a fall.', 'Düşmeyle uyumlu hiçbir yaralanma yok.') },
  { id: 'f-from-behind', text: L('The blow came from behind and to the left.', 'Darbe arkadan ve soldan gelmiş.') },
  { id: 'f-tod', text: L('Thomas died between 23:00 and 23:45.', 'Thomas 23:00 ile 23:45 arasında öldü.') },
  { id: 'f-mallet-42', text: L('The lignum vitae mallet’s face is 42 mm wide.', 'Gayak ağacı tokmağın vuruş yüzü 42 mm.') },
  { id: 'f-mallet-blood', text: L('Thomas’s blood is in the seam of the mallet.', 'Tokmağın birleşim yerinde Thomas’ın kanı var.') },
  { id: 'f-mallet-wiped', text: L('The mallet was wiped with naphtha after use.', 'Tokmak kullanıldıktan sonra neftle silinmiş.') },
  { id: 'f-call-jonas', text: L('Thomas spoke to Jonas for three minutes at 22:43.', 'Thomas 22:43’te Jonas’la üç dakika konuştu.'), time: '22:43', about: ['jonas'] },
  { id: 'f-call-clara', text: L('Thomas spoke to Clara for nearly three minutes at 22:51.', 'Thomas 22:51’de Clara’yla üç dakikaya yakın konuştu.'), time: '22:51', about: ['clara'] },
  { id: 'f-sms', text: L('At 22:55 Thomas texted Clara: come now or I call the police tonight.', '22:55’te Thomas Clara’ya yazdı: hemen gel, yoksa bu gece polisi ararım.'), time: '22:55', about: ['clara'] },
  { id: 'f-miriam-2324', text: L('Miriam’s call at 23:24 went unanswered.', 'Miriam’ın 23:24’teki araması cevapsız kaldı.'), time: '23:24', about: ['miriam'] },
  { id: 'f-front-2146', text: L('The front door was opened from inside at 21:46.', 'Ön kapı 21:46’da içeriden açıldı.'), time: '21:46' },
  { id: 'f-leo-2158', text: L('Leo’s fob opened the back door at 21:58.', 'Leo’nun kartı arka kapıyı 21:58’de açtı.'), time: '21:58', about: ['leo'] },
  { id: 'f-front-2212', text: L('The front door was opened from inside at 22:12.', 'Ön kapı 22:12’de içeriden açıldı.'), time: '22:12' },
  { id: 'f-exit-2219', text: L('Someone left by the back door at 22:19.', 'Biri 22:19’da arka kapıdan çıktı.'), time: '22:19' },
  { id: 'f-clara-2304', text: L('Clara’s fob opened the back door at 23:04.', 'Clara’nın kartı arka kapıyı 23:04’te açtı.'), time: '23:04', about: ['clara'] },
  { id: 'f-exit-2338', text: L('The back door was opened from inside at 23:38 — the last event of the night.', 'Arka kapı 23:38’de içeriden açıldı — gecenin son olayı.'), time: '23:38' },
  { id: 'f-jaguar-in', text: L('Miriam’s Jaguar entered the lane at 21:44.', 'Miriam’ın Jaguar’ı 21:44’te sokağa girdi.'), time: '21:44', about: ['miriam'] },
  { id: 'f-jaguar-out', text: L('Miriam’s Jaguar left the lane at 22:15.', 'Miriam’ın Jaguar’ı 22:15’te sokaktan çıktı.'), time: '22:15', about: ['miriam'] },
  { id: 'f-cyclist-in', text: L('A cyclist with a shoulder bag entered the lane at 21:55.', 'Omuz çantalı bir bisikletli 21:55’te sokağa girdi.'), time: '21:55', about: ['leo'] },
  { id: 'f-cyclist-out', text: L('The cyclist left at 22:22, the bag visibly heavier.', 'Bisikletli 22:22’de çıktı; çantası gözle görülür biçimde ağırlaşmıştı.'), time: '22:22', about: ['leo'] },
  { id: 'f-volvo-in', text: L('Clara’s Volvo entered the lane at 23:02.', 'Clara’nın Volvo’su 23:02’de sokağa girdi.'), time: '23:02', about: ['clara'] },
  { id: 'f-volvo-out', text: L('Clara’s Volvo left the lane at 23:41.', 'Clara’nın Volvo’su 23:41’de sokaktan çıktı.'), time: '23:41', about: ['clara'] },
  { id: 'f-copy-modern', text: L('The vault violin’s varnish is less than two years old.', 'Kasadaki kemanın verniği iki yıldan yeni.') },
  { id: 'f-copy-jf', text: L('The vault violin carries Jonas Feld’s brand “JF”.', 'Kasadaki keman Jonas Feld’in “JF” damgasını taşıyor.'), about: ['jonas'] },
  { id: 'f-is-copy', text: L('The violin in the vault is a copy, not the Guadagnini.', 'Kasadaki keman Guadagnini değil, bir kopya.') },
  { id: 'f-halberd-paid', text: L('Halberd paid €1.1M to Clara’s company CK Atelier on 3 September.', 'Halberd 3 Eylül’de Clara’nın şirketi CK Atelier’ye 1,1 milyon € ödedi.'), about: ['clara'] },
  { id: 'f-halberd-bought', text: L('Halberd in Geneva bought the real Guadagnini.', 'Cenevre’deki Halberd asıl Guadagnini’yi satın aldı.') },
  { id: 'f-loan-repaid', text: L('The next day CK Atelier repaid the Kessler Strings loan.', 'Ertesi gün CK Atelier, Kessler Strings’in kredisini kapattı.'), about: ['clara'] },
  { id: 'f-workbook-ck', text: L('Jonas’s workbook records the copy as commissioned by “C.K.”.', 'Jonas’ın iş defterine göre kopyayı “C.K.” ısmarlamış.'), about: ['clara', 'jonas'] },
  { id: 'f-anchor-2312', text: L('Jonas paid by card at The Anchor at 23:12.', 'Jonas 23:12’de The Anchor’da kartla ödeme yaptı.'), time: '23:12', about: ['jonas'] },
  { id: 'f-ruben-call', text: L('The bartender saw Jonas take a call outside around 22:45 and come back white as a sheet.', 'Barmen, Jonas’ın 22:45 sularında dışarıda telefonla konuşup bembeyaz bir yüzle döndüğünü gördü.'), about: ['jonas'] },
  { id: 'f-anchor-distance', text: L('The Anchor is a 25-minute walk from Brenner Lane.', 'The Anchor, Brenner Sokağı’na yürüyerek 25 dakika.') },
  { id: 'f-pawn-leo', text: L('Leo pawned the Sartory bow at 09:10 the next morning.', 'Leo ertesi sabah 09:10’da Sartory yayı rehine bıraktı.'), about: ['leo'] },

  // ── lab
  { id: 'f-rag-blood', text: L('The rag carries Thomas’s blood.', 'Bezde Thomas’ın kanı var.') },
  { id: 'f-pearl-back', text: L('At her interview Clara’s left pearl stud had a plastic back instead of a gold one.', 'İfade verirken Clara’nın sol inci küpesinde altın değil, plastik bir arkalık vardı.'), about: ['clara'] },
  { id: 'f-note-hand', text: L('The note is in Thomas’s hand and breaks off mid-stroke.', 'Not Thomas’ın el yazısı ve bir harfin ortasında kesiliyor.'), about: ['p-thomas'] },
  { id: 'f-lid-print', text: L('A partial print of Clara’s is on the inside of the violin case lid.', 'Keman kutusunun kapağının iç yüzünde Clara’ya ait kısmi bir iz var.'), about: ['clara'] },

  // ── interviews
  { id: 'f-clara-threat', text: L('Clara admits her father threatened to call the police unless she came.', 'Clara, gelmezse babasının polisi aramakla tehdit ettiğini kabul ediyor.'), about: ['clara'] },
  { id: 'f-clara-sold', text: L('Clara admits selling the Guadagnini to cover the losses.', 'Clara zararları kapatmak için Guadagnini’yi sattığını kabul ediyor.'), about: ['clara'] },
  { id: 'f-clara-loan', text: L('Clara arranged the €900,000 loan; her father signed without reading.', '900.000 €’luk krediyi Clara ayarlamış; babası okumadan imzalamış.'), about: ['clara'] },
  { id: 'f-clara-six', text: L('Clara knew there are six mallets on the wall.', 'Clara duvarda altı tokmak olduğunu biliyordu.'), about: ['clara'] },
  { id: 'f-jonas-told', text: L('At 22:43 Jonas told Thomas that Clara had commissioned the copy.', '22:43’te Jonas, Thomas’a kopyayı Clara’nın ısmarladığını söyledi.'), about: ['jonas', 'clara'] },
  { id: 'f-jonas-ck', text: L('Jonas made the copy for Clara for €8,000 in cash.', 'Jonas kopyayı Clara için 8.000 € nakit karşılığında yaptı.'), about: ['jonas', 'clara'] },
  { id: 'f-no-exhibition', text: L('No insurance exhibition ever took place.', 'Hiçbir sigorta sergisi hiç yapılmadı.'), about: ['clara'] },
  { id: 'f-bank-calls', text: L('The bank rang Clara, not Thomas, behind a closed door.', 'Banka Thomas’ı değil, kapısını kapatan Clara’yı arıyordu.'), about: ['clara'] },
  { id: 'f-miriam-visit', text: L('Miriam admits she was at the workshop from about 21:45 to 22:15.', 'Miriam 21:45 ile 22:15 arası atölyede olduğunu kabul ediyor.'), about: ['miriam'] },
  { id: 'f-miriam-buyer', text: L('Miriam had promised the violin to a buyer in Vienna.', 'Miriam kemanı Viyana’daki bir alıcıya söz vermişti.'), about: ['miriam'] },
  { id: 'f-miriam-notice', text: L('Miriam gave notice on 4 March; Thomas said not before April.', 'Miriam 4 Mart’ta bildirim verdi; Thomas Nisan’dan önce olmaz dedi.'), about: ['miriam'] },
  { id: 'f-miriam-shock', text: L('Miriam never knew her violin had been copied — and never agreed to any sale.', 'Miriam kemanının kopyalandığını hiç bilmiyordu — hiçbir satışa da onay vermedi.'), about: ['miriam'] },
  { id: 'f-miriam-saw-leo', text: L('Miriam saw a young man in a bicycle helmet come in the back during the argument.', 'Miriam tartışma sırasında arkadan bisiklet kasklı genç bir adamın girdiğini gördü.'), about: ['miriam', 'leo'] },
  { id: 'f-leo-woman', text: L('Leo heard Thomas arguing with an older, well-spoken woman.', 'Leo, Thomas’ın yaşlıca, kibar konuşan bir kadınla tartıştığını duydu.'), about: ['leo', 'miriam'] },
  { id: 'f-leo-bow', text: L('Leo admits he took the Sartory bow to pay his debts.', 'Leo borçlarını ödemek için Sartory yayı aldığını kabul ediyor.'), about: ['leo'] },
  { id: 'f-leo-uv', text: L('Around 22:15 Leo saw Thomas examine the violin under UV and heard him say “That’s not right.”', '22:15 sularında Leo, Thomas’ı kemanı UV’de incelerken gördü ve “Bu doğru değil” dediğini duydu.'), time: '22:15', about: ['leo', 'p-thomas'] },
  { id: 'f-leo-copy', text: L('Jonas made a study copy of the Guadagnini last summer.', 'Jonas geçen yaz Guadagnini’nin bir çalışma kopyasını yaptı.'), about: ['jonas'] },
  { id: 'f-clara-earring', text: L('Clara admits the gold earring back is hers, lost beside her father that night.', 'Clara altın küpe arkalığının kendisine ait olduğunu, o gece babasının yanında düşürdüğünü kabul ediyor.'), about: ['clara'] },

  // ── wave 4: side leads (optional; none of them changes what happened)
  // the neighbour's light book (Varga's flat)
  { id: 'f-light-sensor', text: L('The courtyard lamp only comes on for someone walking to the workshop’s back door.', 'Avlu lambası yalnızca atölyenin arka kapısına yürüyen biri için yanıyor.') },
  { id: 'f-light-2303', text: L('At 23:03 the courtyard lamp came on for a woman in a pale coat, walking fast.', '23:03’te avlu lambası hızlı yürüyen, açık renk paltolu bir kadın için yandı.'), time: '23:03' },
  { id: 'f-light-2339', text: L('At 23:39 the lamp came on again: the same woman, going out slowly.', '23:39’da lamba yine yandı: aynı kadın, ağır ağır çıkıyordu.'), time: '23:39' },
  // the night fork and Clara’s flat
  { id: 'f-volvo-naphtha', text: L('Naphtha on the steering wheel and door handle of Clara’s Volvo.', 'Clara’nın Volvo’sunun direksiyonunda ve kapı kolunda neft var.'), about: ['clara'] },
  { id: 'f-coat-naphtha', text: L('Naphtha on the left cuff of Clara’s camel coat.', 'Clara’nın deve tüyü paltosunun sol kolunda neft var.'), about: ['clara'] },
  { id: 'f-geneva-trip', text: L('Clara stayed in Geneva on 2–3 September, on her company’s card.', 'Clara 2–3 Eylül’de Cenevre’de kalmış; şirket kartıyla.'), about: ['clara'] },
  // Miriam’s clause (the false trail) and where it leads
  { id: 'f-clause-death', text: L('If Thomas died, the violin had to go back to Miriam within seven days.', 'Thomas ölürse keman yedi gün içinde Miriam’a dönecekti.'), about: ['miriam'] },
  { id: 'f-brandl', text: L('Miriam’s Vienna buyer, Galerie Brandl, would not wait beyond 31 March.', 'Miriam’ın Viyanalı alıcısı Galerie Brandl, 31 Mart’tan sonrasını beklemeyecekti.'), about: ['miriam'] },
  { id: 'f-halberd-listed', text: L('Since October a Turin Guadagnini of 1772 has been in Halberd’s Geneva catalogue.', 'Ekim’den beri Halberd’in Cenevre kataloğunda 1772 Torino yapımı bir Guadagnini var.') },
  // the bank (the “Bank?? (C.)” line in Thomas’s diary)
  { id: 'f-bank-papers', text: L('Clara drew up the loan papers and initialled every page; Thomas signed only the last.', 'Kredi evrakını Clara hazırlamış, her sayfayı paraflamış; Thomas yalnızca sonuncuyu imzalamış.'), about: ['clara'] },
];

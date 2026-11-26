// SERVER-ONLY. Ash and Glaze — every finding (fact). Its sources are declared where it is found (documents, zones,
// details, claims, lab results, night events). `about` only names people the sentence itself names: a fact found on
// the scene is never filed under a suspect before the player has made that link (PLAYTEST_V4 §7.6).
import type { FactDef } from '../../engine/types.ts';
import { L } from '../text.ts';

export const facts: FactDef[] = [
  // ── briefing and statements
  { id: 'f-call-0158', text: L('Ruth Ekdal called the fire in at 01:58.', 'Ruth Ekdal yangını 01:58’de ihbar etti.'), time: '01:58', about: ['p-ruth'] },
  { id: 'f-buzz-0136', text: L('Ruth heard the gate keypad beep at 01:36.', 'Ruth kapının tuş takımının 01:36’da öttüğünü duydu.'), time: '01:36', about: ['p-ruth'] },
  { id: 'f-coat-figure', text: L('About 01:45 a man in a long dark coat and good shoes crossed the yard to the gate, unhurried.', '01:45 sularında uzun koyu paltolu, iyi ayakkabılı bir adam acele etmeden avluyu geçip kapıya yürüdü.') },
  { id: 'f-codes-reset', text: L('The landlord resets every tenant’s gate code each September and hands out the slips.', 'Ev sahibi her eylül bütün kiracıların kapı şifresini değiştirip kâğıtlarını kendisi dağıtıyor.'), about: ['oskar'] },
  { id: 'f-shed-landlord', text: L('The lamp oil is kept in Dahl’s shed, and only Dahl has the key.', 'Gaz yağı Dahl’ın kulübesinde duruyor ve anahtarı yalnızca Dahl’da.'), about: ['oskar'] },
  { id: 'f-agnes-1830', text: L('Agnes and Selma locked up at 18:30; the kiln was cold and empty.', 'Agnes ile Selma 18:30’da kapattı; fırın soğuk ve boştu.'), time: '18:30', about: ['p-agnes', 'selma'] },
  { id: 'f-heater-banned', text: L('Agnes banned the old heater from the drying room two winters ago; it lives unplugged by the sink.', 'Agnes iki kış önce eski ısıtıcıyı kurutma odasından yasakladı; fişi çekili hâlde lavabonun yanında durur.'), about: ['p-agnes'] },
  { id: 'f-tide-lines', text: L('Forty exhibition pieces were drying on the racks, packed on straw.', 'Kırk sergi parçası rafların üstünde, saman üzerinde kuruyordu.') },
  { id: 'f-oskar-offer', text: L('In April Dahl offered Agnes €40,000 to give up her lease. She laughed.', 'Nisanda Dahl, Agnes’e kirayı bırakması için 40.000 avro teklif etti. Agnes güldü.'), about: ['oskar', 'p-agnes'] },
  { id: 'f-bram-cover', text: L('Bram raised the studio’s insurance in August — at his mother’s request.', 'Bram ağustosta atölyenin sigortasını yükseltti — annesinin isteğiyle.'), about: ['bram'] },
  { id: 'f-kiln-theory', text: L('The fire crew’s first theory: a kiln fault.', 'İtfaiyenin ilk teorisi: fırın arızası.') },
  { id: 'f-alarm-silent', text: L('The smoke alarm sent nothing to the monitoring company.', 'Duman alarmı izleme şirketine hiçbir sinyal göndermedi.') },

  // ── the studio
  { id: 'f-v-pattern', text: L('The burn pattern’s low point is under the drying racks, metres from the kiln.', 'Yanık izinin en alçak noktası kurutma raflarının altında; fırından metrelerce uzakta.') },
  { id: 'f-straw', text: L('The racks stood on straw and wrapping paper; it burned first and hottest.', 'Raflar saman ve ambalaj kâğıdının üstündeydi; ilk ve en çok o yandı.') },
  { id: 'f-kiln-0055', text: L('The kiln’s last programme ended normally at 00:55, with no error code.', 'Fırının son programı 00:55’te sorunsuz bitmiş; hata kodu yok.'), time: '00:55' },
  { id: 'f-sa-pots', text: L('Inside the kiln: six small vessels not on the exhibition list, each stamped S.A.', 'Fırının içinde sergi listesinde olmayan altı küçük kap; her birinde S.A. damgası.') },
  { id: 'f-heater-plugged', text: L('The heater stands against the racks, plugged in, its dial on high.', 'Isıtıcı rafların dibinde duruyor; fişe takılı, düğmesi en yüksekte.') },
  { id: 'f-socket-off', text: L('The wall switch of that socket is off: the heater could not draw a single watt.', 'O prizin duvardaki anahtarı kapalı: ısıtıcı tek bir watt bile çekemezdi.') },
  { id: 'f-heater-home', text: L('The heater’s usual place is marked in the dust of the sink corner — four clean feet.', 'Isıtıcının her zamanki yeri lavabo köşesindeki tozda belli — dört temiz ayak izi.') },
  { id: 'f-no-battery', text: L('The smoke alarm has no battery; the slot is clean.', 'Duman alarmında pil yok; yuvası tertemiz.') },
  { id: 'f-alarm-prints', text: L('One clear, recent set of large prints on the alarm cover’s clip.', 'Alarm kapağının mandalında tek, net ve taze bir set iri parmak izi.') },
  { id: 'f-backdoor-key', text: L('The back door was opened with a key: no marks on lock or frame.', 'Arka kapı anahtarla açılmış: ne kilitte ne kasada iz var.') },
  { id: 'f-inspection', text: L('Dahl held a “safety inspection” of Unit 4 on Friday, 15:00–16:00 — smoke alarms included.', 'Dahl cuma günü 15:00–16:00 arası 4 numarada “güvenlik denetimi” yaptı — duman alarmları dahil.'), about: ['oskar'] },
  { id: 'f-shoeprint', text: L('Prints in the dried slip by the back door: a smooth leather sole, about size 44, a ring of nails in the heel.', 'Arka kapının yanındaki kurumuş çamurda izler: düz deri taban, aşağı yukarı 44 numara, topukta halka hâlinde çiviler.') },
  { id: 'f-uv-trail', text: L('Under UV a splashed trail glows from the back door to the foot of the racks — poured while walking.', 'UV altında arka kapıdan rafların dibine kadar sıçramış bir iz ışıyor — yürürken dökülmüş.') },
  { id: 'f-crate-gap', text: L('A whole crate of seconds is gone from the shelf; the dust outline is fresh.', 'Raftan koca bir kasa ıskarta eksik; tozdaki izi taze.') },

  // ── the yard
  { id: 'f-gate-2115', text: L('At 21:15 the gate opened with the Unit 4 code.', 'Kapı 21:15’te 4 numaranın şifresiyle açıldı.'), time: '21:15' },
  { id: 'f-gate-2318', text: L('At 23:18 a vehicle came in on the Unit 4 code.', '23:18’de 4 numaranın şifresiyle bir araç girdi.'), time: '23:18' },
  { id: 'f-gate-2351', text: L('At 23:51 a vehicle left the yard.', '23:51’de bir araç avludan çıktı.'), time: '23:51' },
  { id: 'f-gate-0040', text: L('At 00:40 someone left the yard on foot.', '00:40’ta biri avludan yürüyerek çıktı.'), time: '00:40' },
  { id: 'f-gate-0136', text: L('At 01:36 the gate opened with the Unit 4 code.', 'Kapı 01:36’da 4 numaranın şifresiyle açıldı.'), time: '01:36' },
  { id: 'f-gate-0144', text: L('At 01:44 someone left the yard on foot.', '01:44’te biri avludan yürüyerek çıktı.'), time: '01:44' },
  { id: 'f-shed-gap', text: L('One bottle is missing from a row of six one-litre bottles of lamp oil in the shed.', 'Kulübedeki altı adet bir litrelik gaz yağı şişesinin birinin yeri boş.') },
  { id: 'f-battery-found', text: L('In the landlord’s shed: a 9-volt battery taped “SMOKE ALARM — June” in Agnes’s hand.', 'Ev sahibinin kulübesinde: üstünde Agnes’in el yazısıyla “DUMAN ALARMI — Haziran” yazan 9 voltluk bir pil.'), about: ['p-agnes'] },
  { id: 'f-cap', text: L('A melted red cap in the gutter outside Unit 4 — from a one-litre bottle of lamp oil.', '4 numaranın önündeki olukta erimiş kırmızı bir kapak — bir litrelik gaz yağı şişesinden.') },
  { id: 'f-matchbook', text: L('A soaked matchbook in the same gutter, an anchor on the cover, three matches torn out.', 'Aynı olukta ıslanmış bir kibrit kutusu; kapağında çapa, üç çöpü koparılmış.') },
  { id: 'f-camera-cable', text: L('The yard camera records to one box only: the recorder in Dahl’s office.', 'Avlu kamerası tek bir cihaza kayıt yapıyor: Dahl’ın ofisindeki kayıt cihazına.'), about: ['oskar'] },
  { id: 'f-shed-drips', text: L('Under UV, drips of oil run from the shed door across the cobbles to Unit 4’s back door.', 'UV altında yağ damlaları kulübenin kapısından arnavutkaldırımı boyunca 4 numaranın arka kapısına uzanıyor.') },

  // ── the yard office
  { id: 'f-master-key', text: L('Dahl carries a master key to every unit on the ring at his belt; the cabinet holds only spares.', 'Dahl her birimin ana anahtarını kemerindeki halkada taşıyor; dolapta yalnızca yedekler var.'), about: ['oskar'] },
  { id: 'f-dvr-paused', text: L('The yard recorder was paused at 01:00 from user ‘odahl’ on a mobile app.', 'Avlu kayıt cihazı 01:00’de ‘odahl’ kullanıcısı tarafından mobil uygulamadan durdurulmuş.'), time: '01:00', about: ['oskar'] },
  { id: 'f-disk-free', text: L('The recorder’s disk is only 38% full.', 'Kayıt cihazının diski yalnızca %38 dolu.') },
  { id: 'f-norrhavn', text: L('Dahl’s sale to Norrhavn: €4.2 million, only if every unit is empty by 31 December.', 'Dahl’ın Norrhavn’a satışı: 4,2 milyon avro, yalnızca bütün birimler 31 Aralık’a kadar boşalırsa.'), about: ['oskar'] },
  { id: 'f-codes-list', text: L('Dahl keeps a copy of every tenant’s gate code in his desk — Unit 4’s included.', 'Dahl bütün kiracıların kapı şifrelerinin bir kopyasını masasında saklıyor — 4 numaranınki de içinde.'), about: ['oskar'] },
  { id: 'f-clause14', text: L('Clause 14.2 of Agnes’s lease: if fire makes the studio unusable, the landlord may end the lease on thirty days’ notice.', 'Agnes’in sözleşmesinin 14.2. maddesi: atölye yangın yüzünden kullanılamaz hâle gelirse ev sahibi sözleşmeyi otuz gün önceden bildirerek feshedebilir.'), about: ['p-agnes'] },
  { id: 'f-margin', text: L('In Dahl’s copy of the lease, “14.2” is underlined twice in pencil.', 'Dahl’ın elindeki sözleşmede “14.2” kurşun kalemle iki kez altı çizilmiş.'), about: ['oskar'] },

  // ── the Harbour Club
  { id: 'f-coat-0108', text: L('Dahl took his coat from the club cloakroom at 01:08.', 'Dahl paltosunu kulübün vestiyerinden 01:08’de aldı.'), time: '01:08', about: ['oskar'] },
  { id: 'f-tab-0102', text: L('Dahl’s bar tab was closed at 01:02.', 'Dahl’ın bar hesabı 01:02’de kapatıldı.'), time: '01:02', about: ['oskar'] },
  { id: 'f-no-taxi', text: L('The club’s door called no car for anyone after 00:40.', 'Kulübün kapısı 00:40’tan sonra kimseye araç çağırmadı.') },
  { id: 'f-club-matches', text: L('The Harbour Club gives out paper matchbooks with an anchor on the cover.', 'Harbour Club, kapağında çapa olan kâğıt kibrit kutuları dağıtıyor.') },
  { id: 'f-nyberg-seat', text: L('At the dinner Dahl sat beside Karl Nyberg of Norrhavn Living.', 'Yemekte Dahl, Norrhavn Living’den Karl Nyberg’in yanında oturdu.'), about: ['oskar', 'p-nyberg'] },
  { id: 'f-teo-foot', text: L('The doorman: Dahl left at 01:10 on foot, towards the harbour, and refused a car.', 'Kapı görevlisi: Dahl 01:10’da limana doğru yürüyerek çıktı, araba istemedi.'), time: '01:10', about: ['oskar', 'p-teo'] },

  // ── the camera and the lab
  { id: 'f-van-in', text: L('23:16: the Vos Ceramics van turns into Fennick Lane.', '23:16: Vos Seramik minibüsü Fennick Sokağı’na giriyor.'), time: '23:16' },
  { id: 'f-van-out', text: L('23:53: the Vos van leaves Fennick Lane; it is not seen again that night.', '23:53: Vos minibüsü Fennick Sokağı’ndan çıkıyor; o gece bir daha görünmüyor.'), time: '23:53' },
  { id: 'f-bike-0044', text: L('00:44: a woman pushing a bicycle leaves Fennick Lane.', '00:44: bisiklet iten bir kadın Fennick Sokağı’ndan çıkıyor.'), time: '00:44' },
  { id: 'f-walker-0131', text: L('01:31: a man on foot in a long dark coat walks into Fennick Lane.', '01:31: uzun koyu paltolu, yürüyen bir adam Fennick Sokağı’na giriyor.'), time: '01:31' },
  { id: 'f-walker-0149', text: L('01:49: the same man walks fast out of Fennick Lane, towards Strandvej.', '01:49: aynı adam hızlı adımlarla Fennick Sokağı’ndan Strandvej’e doğru çıkıyor.'), time: '01:49' },
  { id: 'f-lampoil', text: L('The lab: the ash under the racks holds lamp oil.', 'Laboratuvar: rafların altındaki külde gaz yağı var.') },
  { id: 'f-prints-oskar', text: L('The prints on the alarm cover are Oskar Dahl’s.', 'Alarm kapağındaki izler Oskar Dahl’a ait.'), about: ['oskar'] },
  { id: 'f-heater-cold', text: L('The heater’s element and fuse are untouched: it was never switched on.', 'Isıtıcının rezistansı da sigortası da sağlam: hiç çalışmamış.') },
  { id: 'f-kranz', text: L('Kranz: Bram was at his back door from 00:20 until 02:05, and his door camera shows it.', 'Kranz: Bram 00:20’den 02:05’e kadar arka kapısındaydı; kapı kamerası da gösteriyor.'), time: '00:20', about: ['bram', 'p-kranz'] },
  { id: 'f-salvage-oskar', text: L('Dahl booked the salvage crew at 07:55 on Saturday: clear Unit 4 completely, everything to landfill.', 'Dahl enkaz ekibini cumartesi 07:55’te çağırmış: 4 numara tamamen boşaltılacak, her şey çöplüğe.'), time: '07:55', about: ['oskar'] },
  { id: 'f-nyberg-monday', text: L('Nyberg: at the dinner Dahl told him Unit 4 “won’t be a problem by Monday”.', 'Nyberg: yemekte Dahl ona 4 numaranın “pazartesiye sorun olmaktan çıkacağını” söyledi.'), about: ['oskar', 'p-nyberg'] },

  // ── Dahl’s house
  { id: 'f-coat-oil', text: L('Under UV the right cuff and the hem of Dahl’s overcoat glow with splashes of oil.', 'UV altında Dahl’ın paltosunun sağ kol ağzı ve eteği yağ sıçramalarıyla ışıyor.'), about: ['oskar'] },
  { id: 'f-shoe-gap', text: L('Dahl’s shoe rack has an empty space for black dress shoes, size 44.', 'Dahl’ın ayakkabılığında 44 numara siyah bir kundura çiftinin yeri boş.'), about: ['oskar'] },
  { id: 'f-bridging', text: L('Dahl owes €1.9 million on a bridging loan against the yard, due 31 December.', 'Dahl’ın avluyu teminat gösterdiği 1,9 milyon avroluk bir köprü kredisi borcu var; vadesi 31 Aralık.'), about: ['oskar'] },
  { id: 'f-ash-sole', text: L('In the garden incinerator: the heel of a leather dress shoe, its nails in a ring, crusted with pale clay.', 'Bahçedeki yakma sobasında: deri bir kunduranın topuğu; çivileri halka hâlinde, üstü açık renk çamurla kaplı.') },

  // ── what people say
  { id: 'f-selma-kiln', text: L('Selma came back at 21:15 and fired six of her own pots for a prize in Agnes’s kiln.', 'Selma 21:15’te geri gelip bir ödül için kendi altı parçasını Agnes’in fırınında pişirdi.'), about: ['selma'] },
  { id: 'f-heater-corner', text: L('Selma: at 00:40 she unplugged the heater and pushed it back into its corner by the sink.', 'Selma: 00:40’ta ısıtıcının fişini çekip lavabonun yanındaki köşesine geri itti.'), time: '00:40', about: ['selma'] },
  { id: 'f-selma-saw-bram', text: L('Selma saw Bram take a crate of seconds at 23:20; they agreed to keep quiet.', 'Selma, Bram’ın 23:20’de bir kasa ıskarta aldığını gördü; ikisi de susmaya karar verdi.'), about: ['selma', 'bram'] },
  { id: 'f-selma-ladder', text: L('Selma saw Dahl spend fifteen minutes on a ladder at the smoke alarm on Friday.', 'Selma, cuma günü Dahl’ın on beş dakika merdivende, duman alarmının başında kaldığını gördü.'), about: ['selma', 'oskar'] },
  { id: 'f-selma-weekend', text: L('On Friday Dahl asked Selma whether anyone works in the studio at weekends.', 'Cuma günü Dahl, Selma’ya atölyede hafta sonu çalışan olup olmadığını sordu.'), about: ['selma', 'oskar'] },
  { id: 'f-bram-seconds', text: L('Bram took a crate of his mother’s seconds to sell to Kranz on Ostkai.', 'Bram, annesinin ıskarta işlerinden bir kasayı Ostkai’deki Kranz’a satmak için aldı.'), about: ['bram'] },
  { id: 'f-bram-debt', text: L('Bram owes €60,000 from his café.', 'Bram’ın kafeden 60.000 avro borcu var.'), about: ['bram'] },
  { id: 'f-bram-fee', text: L('In September Dahl offered Bram €15,000 to get his mother out of the lease.', 'Eylülde Dahl, annesini kiradan çıkarması için Bram’a 15.000 avro teklif etti.'), about: ['bram', 'oskar'] },
  { id: 'f-oskar-passed', text: L('Dahl admits he “may have walked past” the yard that night.', 'Dahl o gece avlunun “önünden geçmiş olabileceğini” kabul ediyor.'), about: ['oskar'] },
  { id: 'f-oskar-battery', text: L('Dahl admits he took the alarm battery out on Friday — “to replace it”.', 'Dahl cuma günü alarm pilini çıkardığını kabul ediyor — “değiştirmek için”.'), about: ['oskar'] },
  { id: 'f-oskar-codes', text: L('Dahl admits he sets every gate code and keeps the list.', 'Dahl bütün kapı şifrelerini kendisinin belirlediğini ve listeyi sakladığını kabul ediyor.'), about: ['oskar'] },
  { id: 'f-oskar-shedkey', text: L('Dahl admits the shed key is on his own ring.', 'Dahl kulübenin anahtarının kendi halkasında olduğunu kabul ediyor.'), about: ['oskar'] },
  { id: 'f-warning-letter', text: L('Dahl’s written “warning” about the heater is dated 2 October — the day before his inspection, two days before the fire.', 'Dahl’ın ısıtıcıyla ilgili yazılı “uyarısı” 2 Ekim tarihli — denetiminden bir gün, yangından iki gün önce.'), about: ['oskar'] },
  { id: 'f-car-home', text: L('Dahl’s car never left his garage on Friday night: the bonnet is cold and dusty, the tyres dry.', 'Dahl’ın arabası cuma gecesi garajından hiç çıkmamış: kaput soğuk ve tozlu, lastikler kuru.'), about: ['oskar'] },
  { id: 'f-prize-form', text: L('Selma’s filled-in prize form — her name, six titles, “fired at Vos Ceramics” — lay on the glaze bench and burned.', 'Selma’nın doldurulmuş yarışma formu — adı, altı parçanın adı, “Vos Seramik’te pişirildi” — sır tezgâhının üstündeydi ve yandı.'), about: ['selma'] },
  { id: 'f-selma-programme', text: L('Selma set the kiln to finish at 00:55 and shut the vents before she left.', 'Selma fırını 00:55’te bitecek şekilde ayarladı, çıkmadan önce hava deliklerini kapattı.'), about: ['selma'] },
  { id: 'f-policy-agnes', text: L('The studio’s insurance pays Agnes, not Bram.', 'Atölyenin sigortası Bram’a değil, Agnes’e ödeme yapıyor.'), about: ['bram', 'p-agnes'] },
  { id: 'f-club-wifi', text: L('The club’s wifi log has Dahl’s phone in the cloakroom corridor from 00:58 to 01:03.', 'Kulübün ağ kaydı Dahl’ın telefonunu 00:58 ile 01:03 arası vestiyer koridorunda gösteriyor.'), about: ['oskar'] },
  { id: 'f-handle-oil', text: L('Under UV the back door’s inside handle shows an oily hand.', 'UV altında arka kapının iç kolunda yağlı bir el izi görünüyor.') },
  { id: 'f-crate-23', text: L('At Kranz’s: twenty-three pieces with Agnes’s stamp and chalk cross — the missing seconds.', 'Kranz’da: Agnes’in damgası ve tebeşir çarpısı olan yirmi üç parça — kayıp ıskartalar.'), about: ['p-kranz'] },
  { id: 'f-oskar-knew', text: L('Dahl knows six prize pots were in the kiln — nobody has told him.', 'Dahl fırında ödül için altı kap olduğunu biliyor — oysa ona kimse söylemedi.'), about: ['oskar'] },
];

/* ==========================================================================
   MEDICARE — ALGERIAN CASH ON DELIVERY CHECKOUT INTERACTIVE ENGINE
   58 Wilayas Database, Dependent Communes, Yalidine/ZR Delivery Fee Calculator,
   Free Shipping Progress, Form Validation, Coupon Engine, Order Confirmation
   ========================================================================== */

/* ------------------------------------------------------------------
   ALGERIAN 58 WILAYAS & FULL COMMUNES DATABASE
   ------------------------------------------------------------------ */
const WILAYAS_DATA = [
  { code: '01', name: '01 - Adrar', zone: 'south', communes: ['Adrar','Tamest','Charouine','Reggane','In Zghmir','Titmime','Ksar Kaddour','Tsabit','Aoulef','Timiaouine','Timimoun','Zaouiet Kounta','Fenoughil','Tinerkouk','Deldoul','Sali','Akabli','Ouled Said','Ouled Aissa','Bouda'] },
  { code: '02', name: '02 - Chlef', zone: 'north', communes: ['Chlef','Ténès','Benairia','El Karimia','Taougrite','Beni Haoua','Sobha','Harchoun','Ouled Fares','Sidi Abderrahmane','Medjadja','El Hadjadj','Bouzghaia','Ain Merane','Oued Sly','Abou El Hassan','Chettia','Sidi Akacha','Boukadir','Beni Rached','Talassa','Herenfa','Oued Goussine','El Marsa','Tadjena','Sendjas','Zeboudja','Beni Bouattab','El Attaf','Djendel','El Abadia','Ain Defla'] },
  { code: '03', name: '03 - Laghouat', zone: 'south', communes: ['Laghouat','Ksar El Hirane','Bennasser Benchohra','Sidi Makhlouf','Hassi Delaa','Hassi R\'Mel','Aflou','Ain Mahdi','Tadjmout','Kheneg','Gueltet Sidi Saad','Ain Sidi Ali','Brida','El Ghicha','Hadj Mechri','Sebgag','Taouiala','Tadjrouna','Sidi Bouzid','El Houaita','Oued Morra','Oued M\'zi'] },
  { code: '04', name: '04 - Oum El Bouaghi', zone: 'north', communes: ['Oum El Bouaghi','Ain Beida','Ain M\'lila','Ain Babouche','Berriche','Fkirina','Souk Naamane','Oum El Bouaghi Centre','El Amiria','Ain Kercha','Hanchir Toumghani','El Djazia','Ain Zitoun','Ouled Hamla','Behir Chergui','Sigus','Ain El Beida Sahara','El Fedjoudj Boughrara Saoudi','Guerbes','Dhalaa','Ain Diss','Ghassira','Ain Fakroun','Rahia'] },
  { code: '05', name: '05 - Batna', zone: 'north', communes: ['Batna','Ghisset','Maafa','Merouana','Seriana','M\'doukel','N\'Gaous','Tazoult','Barika','Arris','Boumia','Timgad','Ouyoun El Assafir','Ain Djasser','Tigherghar','Ouled Si Slimane','Oued El Ma','Djerma','Sefiane','El Madher','Ain Yagout','Fesdis','Boulhilat','Laouinate','Bitam','Rahbat','Tighanimine','Menaa','El Akfadou','Oued Chaaba','Gosbat','Oued Taga','Chir','Taxlent','El Hassi','Abdelkader','Tazolt','Kimmel','Tilatou','Teniet El Abed','Dougga','Ouled Ammar','Hidoussa','Ain Touta','Oued Chaaba'] },
  { code: '06', name: '06 - Béjaïa', zone: 'north', communes: ['Béjaïa','Amizour','El Kseur','Seddouk','Tichy','Aokas','Souk El Tenine','Tazmalt','Akbou','Ighram','Adekar','Beni Maouche','Tizi N\'Berber','Chemini','Souk Oufella','Tamokra','Tinebdar','Tibane','Tifra','Boudjellil','Feraoun','Kendira','Draa El Kaid','Toudja','Oued Ghir','Barbacha','El Flaye','Melbou','Beni Ksila','Tala Hamza','Fenaïa Ilmaten','Chellata','Beni Djellil','Aït Smail','Amalou','Ighil Ali','Beni Melikeche','Ouzellaguen','Boukhelifa','Kherrata','Bir Ould Khelifa','Aït Nâemane'] },
  { code: '07', name: '07 - Biskra', zone: 'south', communes: ['Biskra','Oumache','Branis','Chetma','Ouled Djellal','Tolga','Sidi Okba','Zeribet El Oued','El Kantara','Ain Naga','El Outaya','Djemorah','Lichana','Mziraa','M\'chouneche','Ain Zaatout','Bouchagroun','El Haouch','Foughala','Besbes','Ras El Miaad','Doucen'] },
  { code: '08', name: '08 - Béchar', zone: 'south', communes: ['Béchar','Erg Ferradj','Ouled Khodeir','Meridja','Timoudi','Lahmar','Beni Abbes','Kenadsa','Taghit','Beni Ikhlef','Kerzaz','Oulad Khoudir','Igli','El Ouata','Tabelbala','Boukais','Mogheul'] },
  { code: '09', name: '09 - Blida', zone: 'capital', communes: ['Blida','Boufarik','Guerrouaou','Chiffa','Hammam Melouane','Ben Khellil','Soumaa','Mouzaia','El Affroun','Oued Alleug','Bouinan','Beni Tamou','Bougara','Chebli','Larbaa','Meftah','Ouled Yaich','Djebabra','Bouarfa'] },
  { code: '10', name: '10 - Bouira', zone: 'north', communes: ['Bouira','El Asnam','Haizer','Taghzout','Sur El Ghozlane','Ain Bessem','Lakhdaria','Kadiria','Bechloul','M\'Chedallah','Maala','El Adjiba','Dirrah','Ridane','Ain Laloui','Saharidj','Tizi N\'Tleta','Raffour','Dechmia','Bordj Okhriss','Dirah','Ain El Hadjar','Ain Turk','Taguedit','Chorfa','Tillatou'] },
  { code: '11', name: '11 - Tamanrasset', zone: 'south', communes: ['Tamanrasset','Abalessa','In Ghar','In Guezzam','In Salah','Foggaret Azzaouia','Tazrouk','Tin Zaouatine','Ideles'] },
  { code: '12', name: '12 - Tébessa', zone: 'north', communes: ['Tébessa','Bir El Ater','Cheria','Stah Guentis','El Aouinet','El Kouif','Morsott','Ouenza','El Ma El Abiod','El Meridj','Bekkaria','Boukhadra','Ain Zerga','Negrine','Bir Dheheb','Tlidjene','El Ogla','Guorriguer','Safsaf El Ouesra','Ferkane'] },
  { code: '13', name: '13 - Tlemcen', zone: 'north', communes: ['Tlemcen','Mansourah','Chetouane','Remchi','El Fehoul','Hennaya','Ghazaouet','Maghnia','Sebdou','Beni Snous','Beni Boussaid','Honaine','Sidi Abdelli','Souahlia','Msirda Fouaga','El Aricha','Ain Fezza','Ouled Riah','Beni Ouarsous','Sidi Medjahed','Benyoub','Ain Ghoraba','Chouala','Ain Tallout','Ain Youcef','Azails','Terni Beni Hdiel','Zenata','Sabra','Hammam Boughrara','Souk Thlata','Fellaoucene','Amieur','Ain Kebira','Bouhlou','Dar Yaghmouracen','Béni Semiel','Brédia','El Bouihi'] },
  { code: '14', name: '14 - Tiaret', zone: 'north', communes: ['Tiaret','Medroussa','Ain Bouchekif','Ain Deheb','Sougueur','Frenda','Mahdia','Rahouia','Oued Lilli','Ain Kermes','Ksar Chellala','Sidi Ali Mellal','Ain El Hadid','Guertoufa','Sidi Hosni','Dahmouni','Ain Zarit','Bougara','Hamadia','Zmalet El Emir Abdelkader','Meghila','Sebt','Mellakou','Takhemaret','Rechaiga','Naima','Si Abdelghani','Ain El Hadid','Tagdemt'] },
  { code: '15', name: '15 - Tizi Ouzou', zone: 'north', communes: ['Tizi Ouzou','Ain El Hammam','Akbil','Azazga','Boghni','Draa Ben Khedda','Draa El Mizan','Larbaa Nath Irathen','Tigzirt','Azeffoun','Ouaguenoun','Ain Zaouia','Beni Aissi','Beni Douala','Beni Mahmoud','Beni Yenni','Beni Zmenzer','Abi Youcef','Aghribs','Agouni Gueghrane','Aïn El Hamam','Akerrou','Ait Aggouacha','Ait Aissa Mimoun','Ait Bouaddou','Ait Chafaa','Ait Khelili','Ait Mahmoud','Ait Oumalou','Ait Toudert','Ait Yahia','Ait Yahia Moussa','Akerrou','Beni Khelili','Beni Ziki','Boghni','Bounouh','Freha','Frikat','Iflissen','Iferhounene','Imsouhal','Irdjen','Illilten','Maatkas','Makouda','Mechtras','Mekla','Mizrana','Nait Irathen','Ouacif','Ouadhia','Ouaguenoun','Semaoune','Souk El Tenine','Taddart','Tala Ataane','Tirmitine','Timizart','Tizi Gheniff','Tizi Rached','Yatafen','Zekri'] },
  { code: '16', name: '16 - Alger (العاصمة)', zone: 'capital', communes: ['Alger Centre','Sidi M\'Hamed','El Madania','Belouizdad','Bab El Oued','Bologhine','Casbah','Oued Koriche','Birmandreis','El Biar','Bouzareah','Birkhadem','El Harrach','Baraki','Oued Smar','Bachdjerrah','Dar El Beida','Bab Ezzouar','Ben Aknoun','Dely Ibrahim','El Achour','Draria','Cheraga','Ouled Fayet','Ain Benian','Staoueli','Zeralda','Mahelma','Rahmania','Souidania','Hammamet','Douera','Ouled Chebel','Sidi Moussa','Ain Taya','Bordj El Kiffan','El Marsa','Heraoua','Rouiba','Reghaia','Ain Benian','Kouba','Hussein Dey','Mohammed Hadef','Bordj El Bahri','El Magharia','Saoula','Tessala El Merdja'] },
  { code: '17', name: '17 - Djelfa', zone: 'north', communes: ['Djelfa','Moudjebara','Tadmit','Ain El Ibel','Hassi Bahbah','Ain Oussera','Messaad','Dar Chioukh','Zaccar','El Idrissia','Birine','Sidi Ladjel','Had Sahary','Guernini','Selmana','Ain Maabed','El Fashioun','Benhar','Douis','Charef','Ain Chouhada','M\'liliha','Sed Rahal','Faidh El Botma','Oum Laadham','Hassi El Euch','Deldoul'] },
  { code: '18', name: '18 - Jijel', zone: 'north', communes: ['Jijel','Erakene','Seddara','Ziama Mansouriah','Taher','Chekfa','El Milia','El Ancer','Beni Yadjis','Bouchelaghem','Djimla','Selma Benziada','Chahna','Texenna','Kaous','Settara','Ouled Yahia Khedrouche','Ain Makhlouf','Ghebala','Bordj T\'Har','Bouraoui Belhadef','El Aouana'] },
  { code: '19', name: '19 - Sétif', zone: 'north', communes: ['Sétif','Ain El Kebira','Ain Oulmene','El Eulma','Bouandas','Ain Azel','Babor','Guidjel','Kherrata','Beni Aziz','Draa Kebila','Bousselam','Djemila','El Ouricia','Hammam Guergour','Ain El Kebira','Guenzet','Ain Legradj','Medjana','Beni Ourtilane','Amoucha','El Hammam','Tachouda','Bir El Arch','Berhoum','Ain Lahdjar','Ouled Tebben','Mezloug','Bir Araa','Bourdj Bou Arreridj','Oued El Bahem','Serdj El Ghoul','Bellaa','Tizi N\'Bechar','Tizi N\'Bechar','Ain Abessa','Bir Haddada','Ain Roua','Ouled Si Ahmed'] },
  { code: '20', name: '20 - Saïda', zone: 'north', communes: ['Saïda','Ain El Hadjar','Youb','Sidi Boubekeur','El Hassasna','Ouled Brahim','Maamoura','Doui Thabet','Ain Skhouna','Sidi Ahmed','Moulay Larbi','Ain Sultan','Tircine'] },
  { code: '21', name: '21 - Skikda', zone: 'north', communes: ['Skikda','Ain Zouit','El Hadaiek','Azzaba','El Arrouch','Collo','Tamalous','Ben Ziad','Oum Toub','Cheraia','Djendel','Beni Bechir','Ramdane Djamel','Ain Bouziane','Emdjez Edchich','Kerkera','Hamadi Krouma','Ain Kechra','El Marsa','Beni Ouelbane','Fil Fila','Bekkouche Lakhdar','El Ghedir','Ouldja Boulbalout','Kanoua','Sidi Mezghiche','Zerdazas','Ouled Attia','Salah Bouchaour'] },
  { code: '22', name: '22 - Sidi Bel Abbès', zone: 'north', communes: ['Sidi Bel Abbès','Tessala','Sidi Brahim','Mostefa Ben Brahim','Telagh','Ben Badis','Ras El Ma','Sfisef','Ain Thrid','Zerizer','Oued Taourira','Merine','Tilmouni','Ain Kada','Moulay Slissen','El Hachem','Ain El Berd','Tabia','Badredjine','Djillali Ben Amar','Mezaourou','Oued Sebaa','Boudjebha El Bordj','Ain Adden','Marhoum'] },
  { code: '23', name: '23 - Annaba', zone: 'north', communes: ['Annaba','Berrahal','El Hadjar','Eulma','El Bouni','Seraidi','Chetaibi','Asfour','Oued El Aneb','Ain Berda','Cheurfa','Tressay','Treat'] },
  { code: '24', name: '24 - Guelma', zone: 'north', communes: ['Guelma','Nechmaya','Bouati Mahmoud','Heliopolis','Guelaat Bou Sbaa','Hammam Debagh','Oued Zenati','Ain Makhlouf','Belkheir','Hammam N\'bail','Ain Ben Beida','Ayn Larbi','Bouchegouf','Medjez Amar','Medjez Sfa','Ras El Agba','Sellaoua Announa','El Fedjoudj','Oued Fragha','Bendjerrah','El Meridj'] },
  { code: '25', name: '25 - Constantine', zone: 'north', communes: ['Constantine','Hamma Bouziane','Didouche Mourad','Zighoud Youcef','El Khroub','Ain Smara','Ouled Rahmoune','Ain Abid','Ibn Ziad','Beni Hamidane','Mesaoud Boudjeriou'] },
  { code: '26', name: '26 - Médéa', zone: 'north', communes: ['Médéa','Ouzera','Ain Boucif','Berrouaghia','Seghouane','Ksar El Boukhari','Tablat','Beni Slimane','Ain Ouksir','Rebaia','Boghar','Sidi Zahar','Sidi Naamane','Sidi Damed','Sour El Ghozlane','El Omaria','El Aissaouia','Draa Essamar','Tafraout','Oued El Djemai','Ait Bou Aissa','Si Mahdjoub','Saneg','Meftah','Mezghena','Bir Ben Lahreche','Ouled Hellal','Aziz','Bouchrahil','Ouled Maaref','El Hamdania','Mihoub','Souaghi','Chahbounia'] },
  { code: '27', name: '27 - Mostaganem', zone: 'north', communes: ['Mostaganem','Sayada','Fornaka','Stidia','Ain Nouissy','Hassi Mameche','Ain Tedles','Mesra','Bouguerat','Sirat','Achacha','Nekmaria','Ain Boudinar','Ouled Boughalem','El Hassiane','Kheir Eddine','Souaflia','Mansourah','Sidi Ali','Sidi Lakhdar','Oued El Kheir','Touahria','Benabdelmalek Ramdane','Mazagran','Oued Maaza'] },
  { code: '28', name: '28 - M\'Sila', zone: 'north', communes: ['M\'Sila','Hammam Dalaâ','Ouled Derradj','Sidi Aissa','Ain El Hadjel','Bousaada','Ben Srour','Ouled Sidi Ibrahim','Magra','El M\'Hara','Khoubana','Ain Rich','Beni Ilmane','Ouled Slimane','Maadid','Berhoum','Dehahna','Bouti Sayah','Ain Khadra','Tarmount','Sidi Hadjeres','El Hamel','Chellal','Ain El Melh','Menaa','Bir Foda','Dhalaa','El Houamed'] },
  { code: '29', name: '29 - Mascara', zone: 'north', communes: ['Mascara','Bou Hanifia','Tizi','Tighennif','Ghriss','Oued El Taria','Mohammadia','Sig','Ain Fares','El Guettana','Hachem','Froha','Khalouia','Matemore','Beniane','Ain Fekan','Bouhanifia','El Gaada','Ain Frass','Sidi Kada','Oggaz','Nesmoth','El Bordj','Sehailia','Chorfa','Birouaghia','Ain Fekan','Sidi Abdeldjebar','El Mamounia','Sidi Boussaid','Ouled Boussaid','Zahana','Maoussa'] },
  { code: '30', name: '30 - Ouargla', zone: 'south', communes: ['Ouargla','Ain Beida','N\'Goussa','Hassi Messaoud','El Borma','Touggourt','El Allia','Taibet','Temacine','Balidat Ameur','Tebesbest','Zaouia El Abidia','El Hadjira','Nezla','Sidi Slimane','Sidi Khouiled','Meggarine','Bench'] },
  { code: '31', name: '31 - Oran (وهران)', zone: 'north', communes: ['Oran','Gdyel','Bir El Djir','Es Senia','Arzew','Bethioua','Marsat El Hadjadj','Ain El Turk','Bousfer','El Ancor','Boutlelis','Miserghin','El Braya','Sidi Chami','Messerghin','Hassi Ben Okba','Sidi Ben Yebka','Oued Tlélat','Tafraoui','Saint Cloud','El Karma','Ain El Kerma','Ben Freha','Hassi Mefsoukh','Boufatis','Mers El Hadjadj','Kristel','Ain Biya','Bousfer Plage'] },
  { code: '32', name: '32 - El Bayadh', zone: 'south', communes: ['El Bayadh','Rogassa','Stitten','Brezina','Ghassoul','Labiodh Sidi Cheikh','Ain El Orak','El Abiodh Sidi Cheikh','Kef El Ahmar','Mehara','Cheguig','El Kheiter','Arba Jemaa','Sidi Tifour','Erg Ferradj'] },
  { code: '33', name: '33 - Illizi', zone: 'south', communes: ['Illizi','Djanet','Debdeb','Bordj Omar Driss','In Aménas'] },
  { code: '34', name: '34 - Bordj Bou Arréridj', zone: 'north', communes: ['Bordj Bou Arréridj','Ras El Ma','Bordj Zemoura','Mansoura','El M\'hir','Ain Taghrout','Bir Kasdali','Bordj Ghedir','Tixter','El Ach','Colla','El Anseur','Hasnaoua','Ain Tesra','Belimour','Rabta','Taglait','Elmhir','Djaafra','Ain Oulmene'] },
  { code: '35', name: '35 - Boumerdès', zone: 'capital', communes: ['Boumerdès','Boudouaou','Afir','Bordj Menaiel','Baghlia','Dellys','Naciria','Isser','Thenia','Khemis El Khechna','Hammedi','Si Mustapha','Ouled Moussa','Tidjelabine','Chabet El Ameur','Timezrit','Sidi Daoud','Zemmouri','El Kharrouba','Ouled Aissa','Ben Choud','Djinet','Beni Amrane','Souk El Had','Taourga','Larbatache'] },
  { code: '36', name: '36 - El Tarf', zone: 'north', communes: ['El Tarf','Bougous','Ben M\'Hidi','Besbes','El Kala','Zitouna','Ain El Assel','El Aioun','Boutheldja','Chefia','Drean','Zerizer','Raml Souk','Bouteldja','Lac des Oiseaux','Oum Teboul','Souarekh','Chihani','Hammam Beni Salah'] },
  { code: '37', name: '37 - Tindouf', zone: 'south', communes: ['Tindouf','Oum El Assel'] },
  { code: '38', name: '38 - Tissemsilt', zone: 'north', communes: ['Tissemsilt','Bordj Bou Naama','Theniet El Had','Lardjem','Bordj El Emir Abdelkader','Sidi Slimane','Khemisti','Ammari','Sidi Boutouchent','Boucaid','Lazharia','Melaab','Youssoufia','Maacem','Ain Bessam','Beni Lahcen'] },
  { code: '39', name: '39 - El Oued', zone: 'south', communes: ['El Oued','Robbah','Oued El Alenda','Bayadha','Guemar','Reguiba','Magrane','Hassi Khalifa','Taleb Larbi','Douar El Ma','Sidi Aoun','Trifaoui','Hamraia','Kouinine','Oued El Alenda','Mrara','Guemmar','Still','Sidi Khelil','Nakhla','Taghzout','El Ogla','El Mghair','Djamaa','Ouled Djellal','Sidi Slimane','Ourmas'] },
  { code: '40', name: '40 - Khenchela', zone: 'north', communes: ['Khenchela','Mtoussa','Kais','El Hamma','Ain Touila','Babar','Chechar','Bouhmama','El Mahmel','Djellal','Yabous','Ain Skena','Remila','Tamza','Ensigha'] },
  { code: '41', name: '41 - Souk Ahras', zone: 'north', communes: ['Souk Ahras','Sedrata','Hanancha','Machroha','Taoura','Merahna','Ouled Driss','Drea','Ain Zana','Bir Bouhouche','Khedara','Ouled Moumen','Ragouba','Terraguelt','Oum El Adhaim','M\'Daourouch','Ouillen','Safel El Ouiden','Zaarouria','Ain Soltane','Ain Zana','Bir Bouhouche'] },
  { code: '42', name: '42 - Tipaza', zone: 'capital', communes: ['Tipaza','Menaceur','Larhat','Douaouda','Bourkika','Khemisti','Ahmer El Ain','Bourdj El Kiffan','Cherchell','Gouraya','Hadjout','Fouka','Bouchegouf','Bérard','Sidi Amar','Kolea','Ain Tagourait','Bou Ismail','Nador','Chaiba','Meurad','Sidi Ghiles','El Nador','Mazouna','Damous'] },
  { code: '43', name: '43 - Mila', zone: 'north', communes: ['Mila','Ferdjioua','Chelghoum Laid','Oued Athmania','Teleghma','Grarem Gouga','Telerghma','Oued Seguen','El Mechira','Ain Beida Harriche','Sidi Khelifa','Derradji Bousselah','Ain Tine','Oued Endja','Benyahia Abderrahmane','Zeghaia','Tadjenanet','Rouached','Ain Mellouk','Bouhatem','El Ayadi Barbes','Hamala'] },
  { code: '44', name: '44 - Aïn Defla', zone: 'north', communes: ['Aïn Defla','Khemis Miliana','Miliana','Hammouche','El Attaf','El Abadia','Djendel','Bordj Emir Khaled','Ain Torki','Ben Allal','Boumedfaa','Arib','Bathia','Rouina','Sidi Lakhdar','El Maine','Bir Ould Khelifa','Ain Boucif','Hoceinia','Mekhatria','Oued Chorfa','Tacheta Zougagha','Zeddine','Tarik Ibn Ziad','Ain Soltane','Djillali Ben Amar','Ain Bouyahia'] },
  { code: '45', name: '45 - Naâma', zone: 'south', communes: ['Naâma','Mecheria','Ain Sefra','Tiout','Sfissifa','Moghrar','Assela','Makman Ben Amer','Kasdir','El Biod'] },
  { code: '46', name: '46 - Aïn Témouchent', zone: 'north', communes: ['Aïn Témouchent','Hammam Bou Hadjar','El Amria','Hammam Chat','Beni Saf','El Malah','Ain Kihal','Aghlal','Sid Safi','Tamzoura','Ain El Arbaa','Oulhaça El Gheraba','Chaabat El Leham','Aoubellil','Ain Tolba','Bouzedjar','Hassasna','El Emir Abdelkader'] },
  { code: '47', name: '47 - Ghardaïa', zone: 'south', communes: ['Ghardaïa','El Atteuf','Bounoura','Melika','Ddaya','Guerrara','Berriane','Metlili','Zelfana','Mansoura','Sebseb','El Guerrara','Hassi Gara','El Golea'] },
  { code: '48', name: '48 - Relizane', zone: 'north', communes: ['Relizane','Oued Rhiou','Bendaoud','Sidi M\'Hamed Ben Ali','Mazouna','Ammi Moussa','Ramka','El Matmar','Belas','Hamri','Sidi Lazreg','Mendes','Dar Ben Abdellah','Ain Tarek','El Hamadna','Ouled Sidi Mihoub','Hadj Mechri','Kalaa','Yellel','Lahlef','El Ouldja','Ain El Hamam','Haci Sidi Larbi','El Mehdi'] },
  { code: '49', name: '49 - El M\'Ghair', zone: 'south', communes: ['El M\'Ghair','Djamaa','Sidi Khelil','Oum Touyour','Sidi Amrane','Still','Mraier','Ourmas'] },
  { code: '50', name: '50 - El Meniaa', zone: 'south', communes: ['El Meniaa','Hassi Gara','Hassi Fehal','El Golea','Zelfana'] },
  { code: '51', name: '51 - Ouled Djellal', zone: 'south', communes: ['Ouled Djellal','Sidi Khaled','Ras El Miaad','Doucen','M\'ziraa'] },
  { code: '52', name: '52 - Bordj Baji Mokhtar', zone: 'south', communes: ['Bordj Baji Mokhtar','Timiaouine'] },
  { code: '53', name: '53 - Béni Abbès', zone: 'south', communes: ['Béni Abbès','Igli','El Ouata','Tababelt','Ksabi','Beni Ikhlef'] },
  { code: '54', name: '54 - Timimoun', zone: 'south', communes: ['Timimoun','Aoulef','Tinerkouk','Ksar Kaddour','Charouine','Ouled Said','Ouled Aissa','Bouda','Fenoughil','Talmine'] },
  { code: '55', name: '55 - Touggourt', zone: 'south', communes: ['Touggourt','Nezla','Tebesbest','Zaouia El Abidia','Megarine','Temacine','Balidat Ameur','Benziane','El Hadjira','Sidi Slimane'] },
  { code: '56', name: '56 - Djanet', zone: 'south', communes: ['Djanet','Bordj El Haouas'] },
  { code: '57', name: '57 - In Salah', zone: 'south', communes: ['In Salah','In Ghar','Foggaret Azzaouia'] },
  { code: '58', name: '58 - In Guezzam', zone: 'south', communes: ['In Guezzam','Tin Zaouatine'] }
];

/* ------------------------------------------------------------------
   AVAILABLE COURIER COMPANIES
   ------------------------------------------------------------------ */
const COURIERS = [
  {
    id: 'zr-express',
    name: 'ZR Express',
    logo: '⚡',
    badge: 'الأسرع',
    desc: 'توصيل منزلي سريع | الدفع عند الاستلام',
    etaHome: { capital: '24h', north: '24-48h', south: '2-3 Days' },
    fees: { home: { capital: 400, north: 600, south: 900 }, stopdesk: { capital: 250, north: 350, south: 500 } }
  },
  {
    id: 'yalidine',
    name: 'Yalidine Express',
    logo: '🚀',
    badge: 'شريك مفضل',
    desc: 'توصيل للمنزل + استلام من المكتب | تتبع مباشر',
    etaHome: { capital: '24h', north: '48h', south: '2-4 Days' },
    fees: { home: { capital: 420, north: 620, south: 920 }, stopdesk: { capital: 220, north: 330, south: 480 } }
  },
  {
    id: 'mayestro',
    name: 'Mayestro Delivery',
    logo: '📦',
    badge: 'اقتصادي',
    desc: 'الخيار الاقتصادي لجميع الولايات | COD',
    etaHome: { capital: '48h', north: '48-72h', south: '3-5 Days' },
    fees: { home: { capital: 380, north: 580, south: 850 }, stopdesk: { capital: 200, north: 300, south: 450 } }
  }
];

if (typeof window !== 'undefined') {
  window.WILAYAS_DATA = WILAYAS_DATA;
  window.COURIERS = COURIERS;
}

/* ------------------------------------------------------------------
   CHECKOUT ENGINE STATE
   ------------------------------------------------------------------ */
const FREE_SHIPPING_THRESHOLD = 35000; // 35,000 DZD free shipping
let selectedDeliveryType = 'home'; // 'home' or 'stopdesk'
let selectedCourier = 'zr-express'; // default courier
let selectedWilayaObj = null;
let appliedDiscount = 0; // in DZD

document.addEventListener('DOMContentLoaded', async () => {

  const wilayaSelect = document.getElementById('chk-wilaya');
  const communeSelect = document.getElementById('chk-commune');
  const toast = document.getElementById('copy-toast');

  let dbWilayas = typeof WILAYAS_DATA !== 'undefined' ? [...WILAYAS_DATA] : [];
  if (window.MedicareDB && typeof window.MedicareDB.getWilayas === 'function') {
    try {
      const fetched = await window.MedicareDB.getWilayas();
      if (Array.isArray(fetched) && fetched.length >= 58) {
        dbWilayas = fetched;
      }
    } catch (e) {
      console.warn('[Checkout] Using local 58 wilayas dataset:', e);
    }
  }

  /* ------------------------------------------------------------------
     1. POPULATE WILAYAS DROPDOWN (58 Wilayas)
     ------------------------------------------------------------------ */
  if (wilayaSelect) {
    wilayaSelect.innerHTML = '<option value="">-- Select Wilaya (اختر الولاية - 58 ولاية) --</option>' +
      dbWilayas.map(w => `<option value="${w.code}">${w.name}</option>`).join('');
  }

  /* ------------------------------------------------------------------
     2b. PRE-FILL FORM FOR LOGGED-IN CUSTOMER
     ------------------------------------------------------------------ */
  const activeCustomer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;
  if (activeCustomer) {
    const fnEl = document.getElementById('chk-fullname');
    const phEl = document.getElementById('chk-phone');
    const adEl = document.getElementById('chk-address');

    if (fnEl && !fnEl.value && activeCustomer.name)  fnEl.value = activeCustomer.name;
    if (phEl && !phEl.value && activeCustomer.phone) phEl.value = activeCustomer.phone;

    // Pre-fill first saved address if available
    const savedAddr = activeCustomer.addresses && activeCustomer.addresses[0];
    if (savedAddr) {
      if (adEl && !adEl.value && savedAddr.address) adEl.value = savedAddr.address;
    }

    // Show a welcome note
    const chkNotice = document.getElementById('chk-customer-notice');
    if (chkNotice) {
      chkNotice.style.display = 'flex';
      chkNotice.querySelector('#chk-notice-name').textContent = activeCustomer.name;
    }
  }

  /* ------------------------------------------------------------------
     2. WILAYA CHANGE & DEPENDENT COMMUNES
     ------------------------------------------------------------------ */
  window.onWilayaChange = async function(selectEl) {
    const code = selectEl.value;
    selectedWilayaObj = dbWilayas.find(w => w.code === code) || WILAYAS_DATA.find(w => w.code === code);

    if (!selectedWilayaObj) {
      if (communeSelect) {
        communeSelect.innerHTML = '<option value="">-- Select Wilaya First --</option>';
        communeSelect.disabled = true;
      }
      recalculateTotals();
      return;
    }

    // Fetch communes from DB or fallback
    let communesList = [];
    if (window.MedicareDB && typeof window.MedicareDB.getCommunes === 'function') {
      try {
        const dbCommunes = await window.MedicareDB.getCommunes(code);
        if (dbCommunes && dbCommunes.length) communesList = dbCommunes.map(c => c.name);
      } catch (e) {
        console.warn('[Checkout] getCommunes fallback:', e);
      }
    }

    // Fallback to WILAYAS_DATA
    if (!communesList.length) {
      const localObj = WILAYAS_DATA.find(w => w.code === code);
      if (localObj && localObj.communes && localObj.communes.length) {
        communesList = localObj.communes;
      }
    }

    if (!communesList.length && selectedWilayaObj.communes && selectedWilayaObj.communes.length) {
      communesList = selectedWilayaObj.communes;
    }

    // If still empty, extract city name from Wilaya label
    if (!communesList.length) {
      const cleanName = (selectedWilayaObj.name || '').replace(/^\d+\s*-\s*/, '').replace(/\(.*\)/, '').trim();
      communesList = [cleanName || 'Centre Ville'];
    }

    // Populate communes
    if (communeSelect) {
      communeSelect.disabled = false;
      const options = communesList.map(c => `<option value="${c}">${c}</option>`).join('');
      communeSelect.innerHTML = `<option value="">-- Select Commune (اختر البلدية) --</option>${options}<option value="Centre Ville">Centre Ville (وسط المدينة)</option>`;
    }

    if (typeof window.validateField === 'function') window.validateField(selectEl);
    updateCourierDisplay();
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     3. DELIVERY TYPE SELECTOR (Home vs Stop-Desk)
     ------------------------------------------------------------------ */
  window.selectDeliveryType = function(type) {
    selectedDeliveryType = type;
    document.getElementById('delivery-option-home')?.classList.toggle('active', type === 'home');
    document.getElementById('delivery-option-stopdesk')?.classList.toggle('active', type === 'stopdesk');
    updateCourierDisplay();
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     3b. COURIER COMPANY SELECTOR (Dropdown & Live Info Banner)
     ------------------------------------------------------------------ */
  window.onCourierSelectChange = function(courierId) {
    selectedCourier = courierId;
    updateCourierDisplay();
    recalculateTotals();
    const selectEl = document.getElementById('chk-courier');
    if (selectEl && typeof window.validateField === 'function') {
      window.validateField(selectEl);
    }
  };

  window.selectCourier = function(courierId) {
    selectedCourier = courierId;
    const selectEl = document.getElementById('chk-courier');
    if (selectEl) selectEl.value = courierId;
    updateCourierDisplay();
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     3c. DYNAMIC COURIERS & DELIVERY FEES ENGINE
     ------------------------------------------------------------------ */
  function getEffectiveCouriers() {
    try {
      const storedRaw = localStorage.getItem('medicare_delivery_fees');
      if (storedRaw) {
        const fees = JSON.parse(storedRaw);
        if (fees && fees.capital && fees.north && fees.south) {
          const capHome = Number(fees.capital.home);
          const capStop = Number(fees.capital.stopdesk);
          const northHome = Number(fees.north.home);
          const northStop = Number(fees.north.stopdesk);
          const southHome = Number(fees.south.home);
          const southStop = Number(fees.south.stopdesk);

          return COURIERS.map(c => {
            if (c.id === 'zr-express') {
              return {
                ...c,
                fees: {
                  home: { capital: capHome, north: northHome, south: southHome },
                  stopdesk: { capital: capStop, north: northStop, south: southStop }
                }
              };
            } else if (c.id === 'yalidine') {
              return {
                ...c,
                fees: {
                  home: { capital: capHome + 20, north: northHome + 20, south: southHome + 20 },
                  stopdesk: { capital: Math.max(0, capStop - 30), north: Math.max(0, northStop - 20), south: Math.max(0, southStop - 20) }
                }
              };
            } else if (c.id === 'mayestro') {
              return {
                ...c,
                fees: {
                  home: { capital: Math.max(0, capHome - 20), north: Math.max(0, northHome - 20), south: Math.max(0, southHome - 50) },
                  stopdesk: { capital: Math.max(0, capStop - 50), north: Math.max(0, northStop - 50), south: Math.max(0, southStop - 50) }
                }
              };
            }
            return {
              ...c,
              fees: {
                home: { capital: capHome, north: northHome, south: southHome },
                stopdesk: { capital: capStop, north: northStop, south: southStop }
              }
            };
          });
        }
      }
    } catch (e) {
      console.warn('[Checkout] Failed to load custom delivery fees:', e);
    }
    return COURIERS;
  }

  function populateCourierDropdown() {
    const selectEl = document.getElementById('chk-courier');
    if (!selectEl) return;

    const couriersList = getEffectiveCouriers();
    selectEl.innerHTML = couriersList.map(c => `
      <option value="${c.id}" ${selectedCourier === c.id ? 'selected' : ''}>${c.name}</option>
    `).join('');
  }

  function updateCourierDisplay() {
    const couriersList = getEffectiveCouriers();
    const selectEl = document.getElementById('chk-courier');

    // Populate dropdown if not yet initialized
    if (selectEl && selectEl.options.length === 0) {
      populateCourierDropdown();
    }

    if (selectEl && selectedCourier) {
      selectEl.value = selectedCourier;
    }

    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'north';
    const type = selectedDeliveryType;
    const courier = couriersList.find(c => c.id === selectedCourier) || couriersList[0];

    if (!courier) return;

    const fee = courier.fees[type][zone];
    const eta = courier.etaHome[zone];
    const subtotal = getSubtotal();
    const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

    const logoEl = document.getElementById('courier-rate-logo');
    const nameEl = document.getElementById('courier-rate-name');
    const etaEl = document.getElementById('courier-rate-eta');
    const priceEl = document.getElementById('courier-rate-price');
    const infoBox = document.getElementById('courier-rate-info');

    if (logoEl) logoEl.textContent = courier.logo || '📦';
    if (nameEl) nameEl.textContent = courier.name;
    if (etaEl) etaEl.textContent = `⏱ وقت التوصيل: ${eta}`;
    if (priceEl) {
      priceEl.innerHTML = isFree
        ? '<span style="color:#10B981; font-weight:800;">مجاني (FREE)</span>'
        : `${fee.toLocaleString()} <small style="font-size:12px; font-weight:600;">DZD</small>`;
    }
    if (infoBox) infoBox.style.display = 'flex';

    // Update delivery type card price hints if available
    const homeLabel = document.getElementById('home-fee-label');
    const stopdeskLabel = document.getElementById('stopdesk-fee-label');
    if (homeLabel) {
      const hFee = courier.fees['home'][zone];
      homeLabel.textContent = isFree ? '0 DZD' : `${hFee.toLocaleString()} DZD`;
    }
    if (stopdeskLabel) {
      const sFee = courier.fees['stopdesk'][zone];
      stopdeskLabel.textContent = isFree ? '0 DZD' : `${sFee.toLocaleString()} DZD`;
    }
  }

  /* ------------------------------------------------------------------
     4. DELIVERY FEE CALCULATOR (Courier-aware)
     ------------------------------------------------------------------ */
  function getDeliveryFee() {
    const subtotal = getSubtotal();

    // Free shipping threshold check
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'north';
    const couriersList = getEffectiveCouriers();
    const courier = couriersList.find(c => c.id === selectedCourier) || couriersList[0];

    return courier.fees[selectedDeliveryType][zone];
  }

  /* ------------------------------------------------------------------
     5. RECALCULATE TOTALS & FREE SHIPPING PROGRESS
     ------------------------------------------------------------------ */
  function getSubtotal() {
    return window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;
  }

  function recalculateTotals() {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const grandTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

    // Free shipping progress bar
    const progressFill = document.getElementById('shipping-progress-fill');
    const progressText = document.getElementById('shipping-progress-text');
    const progressPct  = document.getElementById('shipping-progress-pct');

    if (progressFill && progressText && progressPct) {
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${pct}%`;
      progressPct.textContent = `${pct}%`;

      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressText.textContent = '🎉 Congratulations! You have earned FREE Express Shipping!';
        progressFill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
      } else {
        const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString();
        progressText.textContent = `🚚 Add ${remaining} DZD more for FREE Express Shipping!`;
        progressFill.style.background = 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-700))';
      }
    }

    // Dynamic fee labels on delivery type cards (use active courier's prices)
    const homeFeeLabel = document.getElementById('home-fee-label');
    const stopdeskFeeLabel = document.getElementById('stopdesk-fee-label');
    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'north';
    const activeCourier = COURIERS.find(c => c.id === selectedCourier) || COURIERS[0];

    const homeFeeVal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : activeCourier.fees.home[zone];
    const stopdeskFeeVal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : activeCourier.fees.stopdesk[zone];

    if (homeFeeLabel) homeFeeLabel.textContent = homeFeeVal === 0 ? 'FREE' : `${homeFeeVal.toLocaleString()} DZD`;
    if (stopdeskFeeLabel) stopdeskFeeLabel.textContent = stopdeskFeeVal === 0 ? 'FREE' : `${stopdeskFeeVal.toLocaleString()} DZD`;

    // Totals table
    const subtotalEl = document.getElementById('chk-subtotal-val');
    const shippingEl = document.getElementById('chk-shipping-val');
    const typeLabelEl = document.getElementById('chk-delivery-type-label');
    const grandTotalEl = document.getElementById('chk-grand-total-val');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} DZD`;
    if (shippingEl) shippingEl.textContent = deliveryFee === 0 ? 'FREE (مجاني)' : `${deliveryFee.toLocaleString()} DZD`;
    if (typeLabelEl) typeLabelEl.textContent = selectedDeliveryType === 'home' ? 'Home' : 'Stop-Desk';
    if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toLocaleString()} DZD`;
  }

  /* ------------------------------------------------------------------
     6. RENDER SUMMARY CART ITEMS
     ------------------------------------------------------------------ */
  function renderCartItems() {
    const listEl = document.getElementById('chk-items-list');
    const countEl = document.getElementById('chk-summary-count');
    const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
    const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;

    if (countEl) countEl.textContent = `${totalQty} Item${totalQty !== 1 ? 's' : ''}`;

    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--color-neutral-500);font-size:13px">Your cart is empty. <a href="index.html">Shop now</a></div>';
      recalculateTotals();
      return;
    }

    listEl.innerHTML = cart.map((item, idx) => {
      const displayName = item.nameAr || item.name;
      const imgSrc = item.image || item.img;
      return `
      <div class="chk-item">
        <img src="${imgSrc}" class="chk-item-img" alt="${displayName}">
        <div class="chk-item-info">
          <div class="chk-item-name">${displayName}</div>
          <div class="chk-item-meta">Size: ${item.size || 'M'} • Color: ${item.color || 'Teal'}</div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
            <div class="mc-cart-qty-ctrl" style="transform:scale(0.85); transform-origin:left center;">
              <button class="mc-qty-btn" type="button" onclick="chkUpdateQty(${idx},-1)">−</button>
              <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
              <button class="mc-qty-btn" type="button" onclick="chkUpdateQty(${idx},1)">+</button>
            </div>
            <button type="button" onclick="chkUpdateQty(${idx},-999)" style="background:none;border:none;color:var(--color-neutral-400);cursor:pointer;font-size:14px;">✕</button>
          </div>
        </div>
        <div class="chk-item-price">${(item.price * item.qty).toLocaleString()} DZD</div>
      </div>`;
    }).join('');

    recalculateTotals();
  }

  window.chkUpdateQty = function(idx, delta) {
    if (window.MedicareCart) {
      window.MedicareCart.updateQty(idx, delta);
    }
    renderCartItems();
  };

  window.addEventListener('medicare_cart_updated', renderCartItems);

  /* ------------------------------------------------------------------
     7. COUPON ENGINE (Dynamic LocalStorage & Multi-Type Discounts)
     ------------------------------------------------------------------ */
  const DEFAULT_CHECKOUT_COUPONS = [
    { id: 'CPN-101', code: 'STUDENT10', type: 'percentage', value: 10, usage_limit: 500, used_count: 142, expiry_date: '', status: 'Active' },
    { id: 'CPN-102', code: 'MEDICARE2026', type: 'fixed', value: 2000, usage_limit: 200, used_count: 89, expiry_date: '2026-12-31', status: 'Active' }
  ];

  let currentAppliedCoupon = null;

  function getAvailableCoupons() {
    try {
      const raw = localStorage.getItem('medicare_coupons');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[Checkout] Failed to parse medicare_coupons from localStorage:', e);
    }
    // Fallback: initialize defaults
    localStorage.setItem('medicare_coupons', JSON.stringify(DEFAULT_CHECKOUT_COUPONS));
    return DEFAULT_CHECKOUT_COUPONS;
  }

  window.applyCoupon = function() {
    const input = document.getElementById('chk-coupon-input');
    const code = input?.value.trim().toUpperCase();

    if (!code) {
      showToast('Please enter a coupon code');
      return;
    }

    const subtotal = getSubtotal();
    const coupons = getAvailableCoupons();
    const coupon = coupons.find(c => (c.code || '').trim().toUpperCase() === code);

    if (!coupon) {
      showToast('❌ Invalid or expired coupon code');
      return;
    }

    if (coupon.status && coupon.status !== 'Active') {
      showToast('❌ This coupon code is currently disabled');
      return;
    }

    if (coupon.expiry_date) {
      const expDate = new Date(coupon.expiry_date + 'T23:59:59');
      if (!isNaN(expDate.getTime()) && expDate < new Date()) {
        showToast('❌ This coupon code has expired');
        return;
      }
    }

    if (coupon.usage_limit && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
      showToast('❌ This coupon has reached its maximum usage limit');
      return;
    }

    let discountAmount = 0;
    let label = '';

    if (coupon.type === 'percentage') {
      const pct = Math.min(100, Math.max(1, Number(coupon.value) || 0));
      discountAmount = Math.round(subtotal * (pct / 100));
      label = `${pct}% OFF`;
    } else {
      // Fixed amount
      const fixedVal = Math.max(0, Number(coupon.value) || 0);
      discountAmount = Math.min(subtotal, fixedVal);
      label = `${fixedVal.toLocaleString()} DZD OFF`;
    }

    appliedDiscount = discountAmount;
    currentAppliedCoupon = coupon;

    const discountRow = document.getElementById('coupon-discount-row');
    if (discountRow) discountRow.style.display = 'flex';
    const discountValEl = document.getElementById('chk-discount-val');
    if (discountValEl) discountValEl.textContent = `−${appliedDiscount.toLocaleString()} DZD`;

    showToast(`✓ Coupon ${coupon.code} applied (${label})!`);
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     8. FORM VALIDATION
     ------------------------------------------------------------------ */
  window.validateField = function(inputEl) {
    if (!inputEl) return true;
    const group = inputEl.closest('.chk-form-group');
    if (!group) return true;

    let valid = true;
    const val = inputEl.value.trim();

    if (inputEl.id === 'chk-fullname') {
      valid = val.length >= 2;
    } else if (inputEl.id === 'chk-phone') {
      // Accepts Algerian numbers: 05xx, 06xx, 07xx, 02xx, 03xx, 04xx, +213..., 00213..., 213..., or 9-14 digits
      const digitsOnly = val.replace(/\D/g, '');
      const localClean = digitsOnly.replace(/^213|^00213/, '0');
      valid = (localClean.length >= 9 && localClean.length <= 11 && localClean.startsWith('0')) ||
              (digitsOnly.length >= 9 && digitsOnly.length <= 14);
    } else if (inputEl.id === 'chk-wilaya') {
      valid = val !== '';
    } else if (inputEl.id === 'chk-commune') {
      valid = val !== '';
    } else if (inputEl.id === 'chk-courier') {
      valid = val !== '';
    } else if (inputEl.id === 'chk-address') {
      // If stopdesk delivery, address is optional or can be short
      valid = val.length >= 2 || selectedDeliveryType === 'stopdesk';
    }

    if (valid) {
      group.classList.remove('error');
      group.classList.add('valid');
    } else {
      group.classList.remove('valid');
      group.classList.add('error');
    }

    return valid;
  };

  /* ------------------------------------------------------------------
     9. ORDER SUBMISSION & CONFIRMATION VIEW
     ------------------------------------------------------------------ */
  window.handleOrderSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const validate = window.validateField || function() { return true; };
    const toast = window.showCheckoutToast || window.showToast || function(m) { alert(m); };

    const fnEl = document.getElementById('chk-fullname');
    const phEl = document.getElementById('chk-phone');
    const wiEl = document.getElementById('chk-wilaya');
    const coEl = document.getElementById('chk-commune');
    const crEl = document.getElementById('chk-courier');
    const adEl = document.getElementById('chk-address');

    // Auto-fill address for Stopdesk if left empty
    if (selectedDeliveryType === 'stopdesk' && adEl && !adEl.value.trim()) {
      adEl.value = 'Stop-Desk Agency Pickup (الاستلام من مكتب الوكالة)';
    }

    const v1 = validate(fnEl);
    const v2 = validate(phEl);
    const v3 = validate(wiEl);
    const v4 = validate(coEl);
    const v5 = validate(crEl);
    const v6 = validate(adEl);

    if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6) {
      const missing = [];
      if (!v1) missing.push('الاسم الكامل (Full Name)');
      if (!v2) missing.push('رقم الهاتف (Phone Number)');
      if (!v3) missing.push('الولاية (Wilaya)');
      if (!v4) missing.push('البلدية (Commune)');
      if (!v5) missing.push('شركة التوصيل (Courier Company)');
      if (!v6) missing.push('العنوان (Address)');

      toast(`❌ يرجى ملء: ${missing.join('، ')}`);
      const firstErr = document.querySelector('.chk-form-group.error');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErr?.querySelector('input, select')?.focus();
      return;
    }

    const currentCartItems = window.MedicareCart ? window.MedicareCart.getCart() : [];
    if (currentCartItems.length === 0) {
      toast('❌ السلة فارغة / Your cart is empty');
      return;
    }

    // Generate Order Object
    const orderNum = `MC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = fnEl.value.trim();
    const phone = phEl.value.trim();
    const commune = coEl.value;
    const wilayaName = selectedWilayaObj ? selectedWilayaObj.name : '16 - Alger';
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const grandTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

    const activeCustomer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;

    const orderPayload = {
      id: orderNum,
      order_number: orderNum,
      customer_id: activeCustomer ? activeCustomer.id : null,
      customer_email: activeCustomer ? activeCustomer.email : null,
      customer_name: fullName,
      phone: phone,
      wilaya: wilayaName,
      commune: commune,
      address: adEl.value.trim(),
      delivery_type: selectedDeliveryType,
      courier_company: selectedCourier,
      courier_name: (COURIERS.find(c => c.id === selectedCourier) || COURIERS[0]).name,
      items: currentCartItems,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: grandTotal,
      status: 'Pending'
    };

    // Save Order via Supabase Client API
    let createdOrder = null;
    if (window.MedicareDB && typeof window.MedicareDB.createOrder === 'function') {
      createdOrder = await window.MedicareDB.createOrder(orderPayload);
    }

    // Deduct purchased quantities from stock & log warehouse movement
    if (window.MedicareDB && typeof window.MedicareDB.updateStock === 'function') {
      currentCartItems.forEach(item => {
        const prodId = item.id || item.productId;
        if (!prodId) return;

        let currentStock = 10;
        if (window.PRODUCT_CATALOG_MAP && window.PRODUCT_CATALOG_MAP[prodId]) {
          currentStock = Number(window.PRODUCT_CATALOG_MAP[prodId].stock ?? 10);
        } else {
          try {
            const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
            if (overrides[prodId] !== undefined) currentStock = Number(overrides[prodId]);
          } catch (e) {}
        }

        const orderQty = Number(item.qty || item.quantity || 1);
        const newStock = Math.max(0, currentStock - orderQty);

        window.MedicareDB.updateStock(prodId, newStock, {
          logMovement: true,
          type: 'OUT',
          qty: orderQty,
          stockBefore: currentStock,
          productName: item.name || item.nameAr || prodId,
          reason: `Customer Order #${orderNum}`,
          staff: 'Online Store Checkout',
          orderNumber: orderNum
        });
      });
    }

    // Clear shared cart after successful submission
    if (window.MedicareCart) {
      window.MedicareCart.clearCart();
    }

    // Increment coupon usage count if coupon applied
    if (currentAppliedCoupon) {
      try {
        const coupons = getAvailableCoupons();
        const cIdx = coupons.findIndex(c => c.id === currentAppliedCoupon.id || c.code === currentAppliedCoupon.code);
        if (cIdx !== -1) {
          coupons[cIdx].used_count = (Number(coupons[cIdx].used_count) || 0) + 1;
          localStorage.setItem('medicare_coupons', JSON.stringify(coupons));
          window.dispatchEvent(new CustomEvent('medicare_coupons_updated'));
        }
      } catch (e) {
        console.warn('[Checkout] Failed to increment coupon usage:', e);
      }
    }

    // Delivery Window Estimate
    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'capital';
    const windowText = zone === 'capital' ? '24–48 Hours' : zone === 'north' ? '48–72 Hours' : '3–5 Business Days';

    // Populate Confirmation View
    document.getElementById('conf-order-num').textContent = `Order #${orderNum}`;
    document.getElementById('conf-customer-name').textContent = fullName;
    document.getElementById('conf-customer-phone').textContent = phone;
    document.getElementById('conf-destination').textContent = `${wilayaName} (Commune: ${commune})`;
    const confCourierName = (COURIERS.find(c => c.id === selectedCourier) || COURIERS[0]).name;
    document.getElementById('conf-delivery-type').textContent = selectedDeliveryType === 'home'
      ? `Home Delivery via ${confCourierName}`
      : `Stop-Desk Pickup via ${confCourierName}`;
    document.getElementById('conf-delivery-window').textContent = windowText;
    document.getElementById('conf-total-due').textContent = `${grandTotal.toLocaleString()} DZD (Cash on Delivery)`;

    // Update Wizard Steps
    document.getElementById('wizard-step-1').classList.remove('active');
    document.getElementById('wizard-step-1').classList.add('completed');
    document.getElementById('wizard-step-2').classList.remove('active');
    document.getElementById('wizard-step-2').classList.add('completed');
    document.getElementById('wizard-step-3').classList.add('active');

    // Switch Views
    document.getElementById('checkout-active-view').style.display = 'none';
    document.getElementById('checkout-confirmation-view').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('🎉 تم تقديم الطلب بنجاح! / Order placed successfully!');
  };

  /* ------------------------------------------------------------------
     10. TOAST & UTILITIES
     ------------------------------------------------------------------ */
  function showToast(msg) {
    const toastEl = document.getElementById('copy-toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }
  // Expose globally so handleOrderSubmit and other callers can reach it
  window.showToast = showToast;

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langDropdownMenu = document.getElementById('lang-dropdown-menu');
  // (langToggleBtn/langDropdownMenu declared here — not at top of handler to avoid duplicate const error)

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (langDropdownMenu) {
        langDropdownMenu.classList.toggle('show');
      } else {
        const cur = window.MC_I18N ? window.MC_I18N.getCurrentLang() : 'en';
        const next = cur === 'en' ? 'ar' : (cur === 'ar' ? 'fr' : 'en');
        if (window.MC_I18N) window.MC_I18N.setLang(next);
      }
    });
  }

  if (langDropdownMenu) {
    langDropdownMenu.querySelectorAll('.mc-lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.lang;
        if (window.MC_I18N) window.MC_I18N.setLang(selected);
        renderCartItems();
        langDropdownMenu.classList.remove('show');
      });
    });

    document.addEventListener('click', e => {
      if (langToggleBtn && !langToggleBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
        langDropdownMenu.classList.remove('show');
      }
    });
  }

  window.addEventListener('medicare_language_changed', () => {
    renderCartItems();
  });

  // Initial render
  populateCourierDropdown();
  updateCourierDisplay();
  renderCartItems();

  // Listeners for real-time delivery fee updates from admin
  window.addEventListener('medicare_delivery_fees_updated', () => {
    updateCourierDisplay();
    recalculateTotals();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'medicare_delivery_fees') {
      updateCourierDisplay();
      recalculateTotals();
    }
  });

});

// Department file for the Student Attendance app — exported from Settings → Administration.
// Replace js/department.js on the website with a newly exported file, then publish.
window.DEPT = {
 "version": 1794586694164,
 "exportedAt": "2026-11-13T16:18:14.164Z",
 "config": {
  "institution": {
   "university": [
    "الجامعة المستنصرية",
    "Mustansiriyah University"
   ],
   "college": [
    "كلية الهندسة",
    "College of Engineering"
   ],
   "department": [
    "قسم هندسة الموارد المائية",
    "Department of Water Resources Engineering"
   ],
   "headTitle": [
    "رئيس قسم هندسة الموارد المائية",
    "Head of the Water Resources Engineering Department"
   ],
   "city": [
    "بغداد",
    "Baghdad"
   ]
  },
  "logos": {
   "university": "logos/university.png",
   "college": "logos/college.png",
   "department": "logos/department.svg"
  },
  "rules": {
   "warn1": 5,
   "warn2": 8,
   "failUnexcused": 10,
   "failTotal": 15,
   "weeksPerTerm": 15
  },
  "committee": {
   "title": [
    "لجنة متابعة غيابات الطلبة",
    "Student Absence Follow-up Committee"
   ],
   "chair": "",
   "member1": "",
   "member2": ""
  },
  "recipients": [
   {
    "id": "r_head",
    "title": "head",
    "name": "",
    "email": "",
    "phone": "",
    "authorized": true
   }
  ],
  "stages": 4,
  "androidApk": "download/WRE-Attendance.apk"
 },
 "accounts": [
  {
   "id": "u_admin",
   "name": "مدير النظام",
   "nameEn": "System administrator",
   "role": "admin",
   "title": "مدير النظام",
   "courses": [],
   "salt": "8325fd7c9a7e2127fdeb2a2509582225",
   "iter": 120000,
   "hash": "45bf4ddb48208c0b0a8f183bce811644375d32780ffe6a9ab264db84bab0d951"
  },
  {
   "id": "u_head",
   "name": "رئيس القسم",
   "nameEn": "Head of Department",
   "role": "head",
   "courses": [],
   "salt": "4433fa5a572593118fa2adf6fad9f697",
   "iter": 120000,
   "hash": "217bb21241880dd2ae8afca8adc126d1dd3e548e50c56fc58f19193db4e72805",
   "title": "رئيس القسم"
  },
  {
   "id": "u_01",
   "name": "اخلاص",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_12"
   ],
   "salt": "889fc8c4b406708e442f0047a1ac07f6",
   "iter": 120000,
   "hash": "9b035d184564f060fb8dc3f2fe9080074200703d361898e93e5b2ea83f3ce41d"
  },
  {
   "id": "u_02",
   "name": "بشير",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_5"
   ],
   "salt": "458d36ed7773a6cf98b05f8ee1367c6e",
   "iter": 120000,
   "hash": "f5f4a7bab901915dae73d5e7c80aade3ddaa010714902d3735cb4c503d98bd55"
  },
  {
   "id": "u_03",
   "name": "تحسين سعد",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_6",
    "c_g1_7",
    "c_g3Y_3",
    "c_g3Y_7"
   ],
   "salt": "85e121f0025d4bc1c3e033a10bab4e6f",
   "iter": 120000,
   "hash": "8ee00dfbc034d186437a40f49a0d17d5eb1a047716aee05256be75257df2c983"
  },
  {
   "id": "u_04",
   "name": "حياة كريم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_1",
    "c_g1_11",
    "c_g2A_10",
    "c_g2A_14"
   ],
   "salt": "4dd41ef2c28c538e898efc6ac4eac932",
   "iter": 120000,
   "hash": "b0f05bb9c01be2f8776c5642fb2d6a1207ad620e7d25c2d8b45d73a5fad35782"
  },
  {
   "id": "u_05",
   "name": "حيدر عباس",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3Y_14",
    "c_g4A_10",
    "c_g4B_7",
    "c_g4Y_7"
   ],
   "salt": "2c944442e62de86e822d4fd71d17dbdc",
   "iter": 120000,
   "hash": "d42983115a9fb74e5e2edead77ad3484392f9c9d33b8c6fdab8affc9d209ef18"
  },
  {
   "id": "u_06",
   "name": "حيدر علي مهدي",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_5"
   ],
   "salt": "e13be290144eb83cb5f318b38b92078b",
   "iter": 120000,
   "hash": "4d09ea736c5ac8ba7797b58680fed21a09f2751edd5ea8dae61d706d6bb36410"
  },
  {
   "id": "u_07",
   "name": "ختام عبد الحسين",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_5",
    "c_g3B_8",
    "c_g3B_12"
   ],
   "salt": "a62226ec6b325d170256d14ba3d17fb4",
   "iter": 120000,
   "hash": "a7fd7692eb7882d982446a7c62ac638a103e2cacacaaa8a72fdaaa68246c99a7"
  },
  {
   "id": "u_08",
   "name": "داليا عبد المناف",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_2",
    "c_g2A_7",
    "c_g3B_5"
   ],
   "salt": "b4547049713480f8b5155e4938a36013",
   "iter": 120000,
   "hash": "2da5622ced13f9b4af85fd7e9d02c8c4c04b4968bd1a4fd53e92254ca35e2e0d"
  },
  {
   "id": "u_09",
   "name": "رسول مجبل",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4A_1",
    "c_g4B_3"
   ],
   "salt": "800280729765d18c9503f16bd6fc28d4",
   "iter": 120000,
   "hash": "a2cef9fae072b03827790a25bc16c7c279917bbea3661c5e10f04b410d197d0a"
  },
  {
   "id": "u_10",
   "name": "زهير عبد حاجم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3Y_9",
    "c_g3Y_13",
    "c_g4B_2",
    "c_g4B_10"
   ],
   "salt": "9355571c95450fab41b4fbab2204c36b",
   "iter": 120000,
   "hash": "2fb0b85c1e0da4f826082fb816729e4ccecd7a038cd32ab16feb6953200238a1"
  },
  {
   "id": "u_11",
   "name": "سحر ستار",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3Y_6",
    "c_g3Y_15"
   ],
   "salt": "184a45a18ab9a99c9c835f78912b8947",
   "iter": 120000,
   "hash": "f57ce3a01acfdb42d6abd95c727ea42d9d3c0ae3b04125c21eb418193844dafd"
  },
  {
   "id": "u_12",
   "name": "سعد حسن",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_10",
    "c_g3Y_4",
    "c_g4A_11",
    "c_g4B_8"
   ],
   "salt": "f2577c0d3d480bf1d7e34c45c734bb4d",
   "iter": 120000,
   "hash": "a8d3fe6f77c5e69ac870a82bf3591e5ded4b163e55fd67f87d18afc13d73f028"
  },
  {
   "id": "u_13",
   "name": "سناء عاجل",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4Y_6",
    "c_g4Y_11"
   ],
   "salt": "b91c7be9fcb3b42cb279693dccebfb11",
   "iter": 120000,
   "hash": "4408294c4c9194ce5f8f5040cbb6f1dc125b502b2c9977713159e5a7ef0ffd01"
  },
  {
   "id": "u_14",
   "name": "شيماء عبد المطلب",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_10",
    "c_g4Y_3",
    "c_g4Y_14"
   ],
   "salt": "6fc5cbf957ada3e85bf99c5878b82712",
   "iter": 120000,
   "hash": "ce50fc5318968a324200677e5550f8d895971ee9ad3b252781b7be91636f5f1e"
  },
  {
   "id": "u_15",
   "name": "صادق سلمان",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4A_6",
    "c_g4B_12",
    "c_g4Y_9"
   ],
   "salt": "87bb35b1bab8fc38de8f246465849619",
   "iter": 120000,
   "hash": "a9e8d7dcc4c08632017d7b42b53e5c8ba40739b46cccf4260855e907c3bafe3d"
  },
  {
   "id": "u_16",
   "name": "صباح حسن",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3Y_16",
    "c_g4A_2",
    "c_g4A_12"
   ],
   "salt": "54f13ac8876bfd0d5e785f38a5a6029a",
   "iter": 120000,
   "hash": "20a689dbd9e199ab80600badd86ef95421478b05f2a7e6a97b6ff0251e80fc5f"
  },
  {
   "id": "u_17",
   "name": "عامر نجم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_3",
    "c_g3B_13"
   ],
   "salt": "14e88fcf5ce3a1fe536d72cf38152229",
   "iter": 120000,
   "hash": "87cc35744d17e7e93ecd28514ab4ce21fa03a02cc9006c447abebe7f4f44420b"
  },
  {
   "id": "u_18",
   "name": "عبد الصاحب توفيق",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_6",
    "c_g3B_9",
    "c_g3Y_5",
    "c_g3Y_12"
   ],
   "salt": "153f3941170d06ab8677c741917ea2aa",
   "iter": 120000,
   "hash": "0b101307d1e48249ad00405bd21fdc1afdd337344837ae3062883e40a3ff4120"
  },
  {
   "id": "u_19",
   "name": "علي ظافر",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_3",
    "c_g2A_6",
    "c_g2A_13",
    "c_g4Y_17"
   ],
   "salt": "658e8449b6c59ab8914f5102cd12ed07",
   "iter": 120000,
   "hash": "223f272e66d34c7fb068c5f80fd98a68352e0e5dbe044d70e978f3c78d108e19"
  },
  {
   "id": "u_20",
   "name": "علي فرحان",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4A_9",
    "c_g4B_11"
   ],
   "salt": "a412ab0a987bb6b8db7a787bea2e0a3b",
   "iter": 120000,
   "hash": "69d53897b817d7c14c9d00e66b4c6b520cdf64cc3143d4e0b0006215d06fc282"
  },
  {
   "id": "u_21",
   "name": "علي قاسم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_10",
    "c_g3Y_11",
    "c_g4A_3",
    "c_g4B_9",
    "c_g4Y_10"
   ],
   "salt": "bcd54e676b45f3ce9735a5b25b0654cf",
   "iter": 120000,
   "hash": "83b820cf2b609f97a6bac719d23713e990a79805f3d17afa4375e00875b76720"
  },
  {
   "id": "u_22",
   "name": "علي كفاح",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_4",
    "c_g1_7",
    "c_g1_8"
   ],
   "salt": "dc456dbac1e5f5a4ec9b38a476ad723a",
   "iter": 120000,
   "hash": "010268925952f379cc5ae6a91f45d2a917eb205245178626c14a16fd527a5446"
  },
  {
   "id": "u_23",
   "name": "عمار عبد الستار",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_1",
    "c_g2A_9",
    "c_g2A_11"
   ],
   "salt": "27460db2db0d7eced6f43e3441f029e4",
   "iter": 120000,
   "hash": "2dedc951d003614f950d42f6c78957094bed3c6d3d7b928371ad45c1bdf49a2d"
  },
  {
   "id": "u_24",
   "name": "فارس وليد",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4Y_1",
    "c_g4Y_5",
    "c_g4Y_15",
    "c_g4Y_17"
   ],
   "salt": "be4dda10519048b169415a0ad2b2df63",
   "iter": 120000,
   "hash": "2998177a4894dd5957a48ce6f6ba46c722b3f3da2d9c553ac9f8f8219fb8df3a"
  },
  {
   "id": "u_25",
   "name": "كريم رشيد",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4A_8",
    "c_g4B_1",
    "c_g4Y_2",
    "c_g4Y_12"
   ],
   "salt": "74ce05307b5f9e2684a0a2b0c2f50d30",
   "iter": 120000,
   "hash": "d3893f385ab822b50d67901749d5b54c6dc0f0aa50e9db24ce54ec62a66c7b24"
  },
  {
   "id": "u_26",
   "name": "لؤي خليل",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_4",
    "c_g2A_9",
    "c_g4Y_15",
    "c_g4Y_16"
   ],
   "salt": "2733d438ce519255179ee08fb1efdfe2",
   "iter": 120000,
   "hash": "d06531d8dce4272ad0d0a1476b66ab6ae94af54df91087bae2d83fdeda4d0f14"
  },
  {
   "id": "u_27",
   "name": "مالك حبيب",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_5",
    "c_g4A_5",
    "c_g4A_10",
    "c_g4B_6",
    "c_g4B_7"
   ],
   "salt": "bb5bd1b8538ee31d8d5d61678975d86a",
   "iter": 120000,
   "hash": "fb7434c25ba2b24f3c356510647af299393ee0516da215bcd31907c86f463d1b"
  },
  {
   "id": "u_28",
   "name": "محمد عابد",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_10",
    "c_g3Y_11",
    "c_g4A_4",
    "c_g4A_5",
    "c_g4B_5",
    "c_g4B_6",
    "c_g4Y_13"
   ],
   "salt": "89ae21bfd59f54dce6975078ba4449c5",
   "iter": 120000,
   "hash": "65fc38a611e32d420640e85baa59a7f32560cf424e11de92589d980353d5586d"
  },
  {
   "id": "u_29",
   "name": "محمد عبد الحسين",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_2",
    "c_g3B_11",
    "c_g3Y_1",
    "c_g3Y_17"
   ],
   "salt": "3e72bf2be206b5934c0ae752e4af1f48",
   "iter": 120000,
   "hash": "eb9723ceb5102f149063816c78b9e31031901322e2f9b8159cf0b6317f87fcad"
  },
  {
   "id": "u_30",
   "name": "مي سمير",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_4",
    "c_g3B_10",
    "c_g3B_14"
   ],
   "salt": "07d2fefe0be24be90b5c0adaa81e647c",
   "iter": 120000,
   "hash": "59921c166a22d153871bb031bbb105a61c6e3d35731fd6e72784f8c1b9724ab3"
  },
  {
   "id": "u_31",
   "name": "نور صباح عبود",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g2A_3",
    "c_g2A_8",
    "c_g4A_5",
    "c_g4B_6",
    "c_g4Y_17"
   ],
   "salt": "d37dedc7ff22dac10c8e2d75ce065730",
   "iter": 120000,
   "hash": "84604ec2e6eb7c48a4596e8e27fc11427d9e7a4e67b6e97751bd3ddb59af6492"
  },
  {
   "id": "u_32",
   "name": "نور عدنان",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_3",
    "c_g1_10",
    "c_g3Y_6",
    "c_g3Y_10"
   ],
   "salt": "fe0016bbcf14154b8315aab056b749a9",
   "iter": 120000,
   "hash": "445d7dd639aa2e098584c43dec8034b19efb097a0686633e9e8bfd7344d961b6"
  },
  {
   "id": "u_33",
   "name": "نورا جاسم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_2",
    "c_g1_9"
   ],
   "salt": "2bb61b85078eeb7675e70e00d1716c64",
   "iter": 120000,
   "hash": "7e00c48be00bb892427460d01f900eb41acdef18f165400bf300e7239ac177b4"
  },
  {
   "id": "u_34",
   "name": "هبة كاظم",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g1_7",
    "c_g2A_13"
   ],
   "salt": "75654cbb4b1ee6a7124f457a2bc0112a",
   "iter": 120000,
   "hash": "8074b38091f63822b114588798d66d316fa13c12630a8da4c710f96e308a4f92"
  },
  {
   "id": "u_35",
   "name": "هدى طارق",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g3B_1",
    "c_g3B_7",
    "c_g3Y_2",
    "c_g3Y_8"
   ],
   "salt": "1c0edb88b85d3bb6c52d909acffb345a",
   "iter": 120000,
   "hash": "79b5e174f23ac09ce2a1aff349a9b2ffb8a710b51f7d109c6504bc0b6f82229f"
  },
  {
   "id": "u_36",
   "name": "هدى عباس",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4Y_15",
    "c_g4Y_16"
   ],
   "salt": "a985cc967a8036faf90f4d740c8afaa7",
   "iter": 120000,
   "hash": "e4bbab1fa7c33e9c1111bd8a1cbe78248738a961093db7cb5b836da9c6f19616"
  },
  {
   "id": "u_37",
   "name": "هشام سلام",
   "nameEn": "",
   "role": "lecturer",
   "courses": [
    "c_g4A_5",
    "c_g4B_6",
    "c_g4Y_4"
   ],
   "salt": "6a3adb8d1bf867631e8576db1ad86369",
   "iter": 120000,
   "hash": "50fad5382845d4a6ec4ae1c2f25b91ffdc9a3fef0cd04abf1c8ca8377d056361"
  }
 ],
 "lists": {
  "years": [
   {
    "id": "2026-2027",
    "name": "2026-2027",
    "start": "2026-09-20",
    "end": "2027-05-13",
    "terms": [
     {
      "id": "t1",
      "start": "2026-09-20",
      "end": "2026-12-31",
      "weeks": 15
     },
     {
      "id": "t2",
      "start": "2027-01-31",
      "end": "2027-05-13",
      "weeks": 15
     }
    ],
    "events": [
     {
      "nameAr": "بدء الامتحانات النصف سنوية / النهائية للفصل الأول",
      "nameEn": "Mid-year / term-1 final exams begin",
      "start": "2027-01-03",
      "end": "2027-01-03"
     },
     {
      "nameAr": "العطلة الربيعية",
      "nameEn": "Spring break",
      "start": "2027-01-17",
      "end": "2027-01-30"
     },
     {
      "nameAr": "بدء الامتحانات النهائية للدور الأول / الفصل الثاني",
      "nameEn": "Final exams (1st round / term 2) begin",
      "start": "2027-05-16",
      "end": "2027-05-16"
     },
     {
      "nameAr": "العطلة الصيفية",
      "nameEn": "Summer break",
      "start": "2027-07-01",
      "end": "2027-08-31"
     },
     {
      "nameAr": "بدء امتحانات الدور الثاني",
      "nameEn": "Second-round exams begin",
      "start": "2027-09-01",
      "end": "2027-09-01"
     }
    ]
   }
  ],
  "groups": [
   {
    "id": "g1",
    "stage": 1,
    "system": "bologna",
    "section": "",
    "nameAr": "المرحلة الأولى",
    "nameEn": "Stage 1",
    "yearId": "2026-2027"
   },
   {
    "id": "g2A",
    "stage": 2,
    "system": "bologna",
    "section": "A",
    "nameAr": "المرحلة الثانية - بولونيا A",
    "nameEn": "Stage 2 - Bologna A",
    "yearId": "2026-2027"
   },
   {
    "id": "g3B",
    "stage": 3,
    "system": "bologna",
    "section": "",
    "nameAr": "المرحلة الثالثة - بولونيا",
    "nameEn": "Stage 3 - Bologna",
    "yearId": "2026-2027"
   },
   {
    "id": "g3Y",
    "stage": 3,
    "system": "annual",
    "section": "",
    "nameAr": "المرحلة الثالثة - السنوي",
    "nameEn": "Stage 3 - Annual",
    "yearId": "2026-2027"
   },
   {
    "id": "g4A",
    "stage": 4,
    "system": "bologna",
    "section": "A",
    "nameAr": "المرحلة الرابعة - بولونيا A",
    "nameEn": "Stage 4 - Bologna A",
    "yearId": "2026-2027"
   },
   {
    "id": "g4B",
    "stage": 4,
    "system": "bologna",
    "section": "B",
    "nameAr": "المرحلة الرابعة - بولونيا B",
    "nameEn": "Stage 4 - Bologna B",
    "yearId": "2026-2027"
   },
   {
    "id": "g4Y",
    "stage": 4,
    "system": "annual",
    "section": "A",
    "nameAr": "المرحلة الرابعة - السنوي A",
    "nameEn": "Stage 4 - Annual A",
    "yearId": "2026-2027"
   }
  ],
  "students": [
   {
    "id": "s_g2A_1",
    "groupId": "g2A",
    "name": "امنة علي جاسم علي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_2",
    "groupId": "g2A",
    "name": "ايات كاظم جابر جاسم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_3",
    "groupId": "g2A",
    "name": "بنين احمد جبار حسين",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_4",
    "groupId": "g2A",
    "name": "بنين عباس كريم حنون",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_5",
    "groupId": "g2A",
    "name": "تقى نصير هاشم منيهل",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_6",
    "groupId": "g2A",
    "name": "جراح عامر عبدالله لطيف",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_7",
    "groupId": "g2A",
    "name": "حسين علي صبار",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_8",
    "groupId": "g2A",
    "name": "حسين مصطفى عبد عباس",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_9",
    "groupId": "g2A",
    "name": "رقية فلاح محمد علي اكبر",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_10",
    "groupId": "g2A",
    "name": "ريتاج نصير رحيم شريف",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_11",
    "groupId": "g2A",
    "name": "ريم اركان هادي طالب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_12",
    "groupId": "g2A",
    "name": "شمس محمد قاسم حسين",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_13",
    "groupId": "g2A",
    "name": "شهد محمد احمد جايم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_14",
    "groupId": "g2A",
    "name": "طيبة احمد كاطع رضا",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_15",
    "groupId": "g2A",
    "name": "علا عبدالخالق خلف عبد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_16",
    "groupId": "g2A",
    "name": "غدير احمد زغير عاصي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_17",
    "groupId": "g2A",
    "name": "محمد مشعان محمد عمر",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_18",
    "groupId": "g2A",
    "name": "مريم محمد بهجت ياسين",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_19",
    "groupId": "g2A",
    "name": "ملاك فؤاد كاظم بربوت",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_20",
    "groupId": "g2A",
    "name": "منتظر نعيم عبد الرضا ساجت",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_21",
    "groupId": "g2A",
    "name": "مهدي كاظم حنيحن عبود",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_22",
    "groupId": "g2A",
    "name": "نور الهدى مهدي شجاع عبد الله",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_23",
    "groupId": "g2A",
    "name": "نورة حسين مرزة",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_24",
    "groupId": "g2A",
    "name": "هديل غازي عبد الرضا جمعه",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g2A_25",
    "groupId": "g2A",
    "name": "عبد الكريم محمد حسن كريم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_1",
    "groupId": "g3B",
    "name": "أيهم احمد خلف جمعة الدراجي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_2",
    "groupId": "g3B",
    "name": "إبراهيم محمد ابراهيم حسن المشهداني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_3",
    "groupId": "g3B",
    "name": "المنتظر مازن صلاح عبد الزهرة الخفاجي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_4",
    "groupId": "g3B",
    "name": "بنين مروان محمود حسين الحياني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_5",
    "groupId": "g3B",
    "name": "تبارك مسعود موسى عبد علي العناوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_6",
    "groupId": "g3B",
    "name": "خيرات اياد لطيف حمادي المشهداني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_7",
    "groupId": "g3B",
    "name": "زبيدة بسام نايف محمد الخلف",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_8",
    "groupId": "g3B",
    "name": "زينب اطلس حامد عودة الدهيمي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_9",
    "groupId": "g3B",
    "name": "زينب حسن كاظم ماجد المالكي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_10",
    "groupId": "g3B",
    "name": "سمارة سعد ناقد ناجي الحكيم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_11",
    "groupId": "g3B",
    "name": "عباس صفاء نوري ياسين العزاوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_12",
    "groupId": "g3B",
    "name": "عبد الله ماجد شاكر محمود العبيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_13",
    "groupId": "g3B",
    "name": "علي عمر غسان ابراهيم العزي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_14",
    "groupId": "g3B",
    "name": "عمار عادل صالح عباس الحيدري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_15",
    "groupId": "g3B",
    "name": "فاطمة رافد نايف رفيق العبيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_16",
    "groupId": "g3B",
    "name": "فاطمة علي سهيل عبد الله الطليعي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_17",
    "groupId": "g3B",
    "name": "كامل صلاح كامل سليمان الحجاج",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_18",
    "groupId": "g3B",
    "name": "محمد تقي جلال صالح سهيري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_19",
    "groupId": "g3B",
    "name": "محمد حامد سلمان عبد العامري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_20",
    "groupId": "g3B",
    "name": "محمد عبد اللطيف احمد سالم الكبيسي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_21",
    "groupId": "g3B",
    "name": "مريم باسم كامل حذية الزيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_22",
    "groupId": "g3B",
    "name": "مريم علي اسماعيل عباس العبيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g3B_23",
    "groupId": "g3B",
    "name": "يحيى طارق بدر اسماعيل الزبيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_1",
    "groupId": "g4A",
    "name": "أحمد ثائر حبيب جلوي السعدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_2",
    "groupId": "g4A",
    "name": "أحمد صالح ماضي فاضل الدراجي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_3",
    "groupId": "g4A",
    "name": "اسامة ناصر محمد شلاهي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_4",
    "groupId": "g4A",
    "name": "أية عقيل حميد وداعه اللامي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_5",
    "groupId": "g4A",
    "name": "أيسر نصير داود سلوم الدليمي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_6",
    "groupId": "g4A",
    "name": "أيمن احمد علوان حمودي الحياني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_7",
    "groupId": "g4A",
    "name": "باقر ناظم خنجر معن الساعدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_8",
    "groupId": "g4A",
    "name": "تبارك طه عبد السادة جبر السليماوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_9",
    "groupId": "g4A",
    "name": "جعفر اياد جبار حران",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_10",
    "groupId": "g4A",
    "name": "جنات صباح فاخر سعد السوداني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_11",
    "groupId": "g4A",
    "name": "حسين عبد الكريم سعيد ابراهيم الموسوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_12",
    "groupId": "g4A",
    "name": "دعاء حيدر جاسم محمد البياتي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_13",
    "groupId": "g4A",
    "name": "ذو الفقار كاظم قاسم حسن الرويشداوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_14",
    "groupId": "g4A",
    "name": "رحمه عباس حميد كاظم التميمي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_15",
    "groupId": "g4A",
    "name": "روان عمر قيس خير الله الناصري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_16",
    "groupId": "g4A",
    "name": "ريهام عمر حسين علي الجبوري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_17",
    "groupId": "g4A",
    "name": "زهراء عبد الكاظم عبد الحسن نبهان ابراهيمي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_18",
    "groupId": "g4A",
    "name": "زيد شاكر محمود جاسم الزيدي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_19",
    "groupId": "g4A",
    "name": "سجاد علي حسين حمود الكعبي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_20",
    "groupId": "g4A",
    "name": "عبد الله سامي علي ابراهيم الاركي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_21",
    "groupId": "g4A",
    "name": "ماجد محمد ماجد لازم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_22",
    "groupId": "g4A",
    "name": "محمد الصادق كريم محسن ركن الخشاتي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_23",
    "groupId": "g4A",
    "name": "محمد جهاد علي حسين العامري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_24",
    "groupId": "g4A",
    "name": "هبه صدام حسين خلف العلواني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4A_25",
    "groupId": "g4A",
    "name": "يوسف عرفان اسماعيل محمد الحقي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_1",
    "groupId": "g4B",
    "name": "أثير محمود حمزة وريور الشمري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_2",
    "groupId": "g4B",
    "name": "أحمد علي كاظم لفته القيران",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_3",
    "groupId": "g4B",
    "name": "أرشد حامد محمد سعدون الغريري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_4",
    "groupId": "g4B",
    "name": "إسراء قحطان عدنان حسن الجنابي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_5",
    "groupId": "g4B",
    "name": "ايمن ناظم حديد راشد المعموري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_6",
    "groupId": "g4B",
    "name": "زينب زاهر جبار عبد العبودي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_7",
    "groupId": "g4B",
    "name": "سجى حسين علي محمود العزاوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_8",
    "groupId": "g4B",
    "name": "عقيل فاضل عبد الرضا حاتم الزيداوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_9",
    "groupId": "g4B",
    "name": "علي زياد خلف رحيمة السراي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_10",
    "groupId": "g4B",
    "name": "علي مكي حسين عبد الرسول المطوق",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_11",
    "groupId": "g4B",
    "name": "غصون علاء لطوف بغدادي الراوي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_12",
    "groupId": "g4B",
    "name": "فاطمة سعد علي عبد الله البدرانية",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_13",
    "groupId": "g4B",
    "name": "كرار حيدر فاضل عوده الترابي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_14",
    "groupId": "g4B",
    "name": "لانه حيدر نافع عبد الله الطائي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_15",
    "groupId": "g4B",
    "name": "محمد الصادق ناصر عبد السادة جبر الكعبي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_16",
    "groupId": "g4B",
    "name": "محمد حسن نصير عدنان الزاملي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_17",
    "groupId": "g4B",
    "name": "مصطفى فريد حميد شهاب الجواري",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_18",
    "groupId": "g4B",
    "name": "مصطفى مرعي حسن سكر العتابي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_19",
    "groupId": "g4B",
    "name": "ميقات علي سلمان دقار اليعكوب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_20",
    "groupId": "g4B",
    "name": "نبا علي كاظم عبيد فريجات",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_21",
    "groupId": "g4B",
    "name": "وفية راشد طعمة عباس الحمداني",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4B_22",
    "groupId": "g4B",
    "name": "يوسف عمار مجيد حميد تيلجي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_1",
    "groupId": "g4Y",
    "name": "إبراهيم صادق سعدون عناد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_2",
    "groupId": "g4Y",
    "name": "احمد ماجد عيسى علي",
    "sid": "",
    "note": "*"
   },
   {
    "id": "s_g4Y_3",
    "groupId": "g4Y",
    "name": "بركات محمد خلف جاسم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_4",
    "groupId": "g4Y",
    "name": "حذيفة يوسف ابراهيم حمدان",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_5",
    "groupId": "g4Y",
    "name": "حسين علي ناصر حسين",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_6",
    "groupId": "g4Y",
    "name": "حسين فراس محمد راضي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_7",
    "groupId": "g4Y",
    "name": "رنا علي خضر اسود",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_8",
    "groupId": "g4Y",
    "name": "ريام شاكر ياسين حمادي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_9",
    "groupId": "g4Y",
    "name": "سجاد حسين موسى سالم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_10",
    "groupId": "g4Y",
    "name": "سجاد علي حمزة هجوج",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_11",
    "groupId": "g4Y",
    "name": "سيف عبد مشعل سطام",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_12",
    "groupId": "g4Y",
    "name": "شمس رعد عطية فنجان",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_13",
    "groupId": "g4Y",
    "name": "طيبة عمار جبار متعب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_14",
    "groupId": "g4Y",
    "name": "عباس عدي عادل رضا",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_15",
    "groupId": "g4Y",
    "name": "عبد الجبار احمد محمود جاسم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_16",
    "groupId": "g4Y",
    "name": "عبد الرحمن سهيل نجم عبدالله",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_17",
    "groupId": "g4Y",
    "name": "عبد الله محمد عبد الجبار سبع",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_18",
    "groupId": "g4Y",
    "name": "عبدالله عبد المنعم جاسب فرج",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_19",
    "groupId": "g4Y",
    "name": "علي باسم غازي لفته",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_20",
    "groupId": "g4Y",
    "name": "علي مثنى محمد حميد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_21",
    "groupId": "g4Y",
    "name": "علي محمد رزيج عبعوب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_22",
    "groupId": "g4Y",
    "name": "فاطمة إبراهيم غازي زياره",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_23",
    "groupId": "g4Y",
    "name": "فاطمة احمد عباس حسن",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_24",
    "groupId": "g4Y",
    "name": "محمد عطا الله عبد عون رعد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_25",
    "groupId": "g4Y",
    "name": "مريم طه غانم طه",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_26",
    "groupId": "g4Y",
    "name": "مصطفى بلال احمد شهاب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_27",
    "groupId": "g4Y",
    "name": "مصطفى صالح مهدي سويلم",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_28",
    "groupId": "g4Y",
    "name": "مصطفى عامر فرحان علي",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_29",
    "groupId": "g4Y",
    "name": "مصطفى عبدالكريم مؤيد عبدالستار",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_30",
    "groupId": "g4Y",
    "name": "منتظر صالح هادي عبد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_31",
    "groupId": "g4Y",
    "name": "منتظر وليد عبدالرضا حسين",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_32",
    "groupId": "g4Y",
    "name": "مهدي رشيد حاتم رشيد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_33",
    "groupId": "g4Y",
    "name": "موج احمد ابراهيم حمزة",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_34",
    "groupId": "g4Y",
    "name": "نسرين كاظم كريم خلف",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_35",
    "groupId": "g4Y",
    "name": "نور اسعد راضي خلف",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_36",
    "groupId": "g4Y",
    "name": "نورالحسين عادل علي محمد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_37",
    "groupId": "g4Y",
    "name": "هاجر محمد جاسم محمد",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_38",
    "groupId": "g4Y",
    "name": "يمامة يعقوب صبر عذاب",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_39",
    "groupId": "g4Y",
    "name": "يوسف باسم لطيف صالح",
    "sid": "",
    "note": ""
   },
   {
    "id": "s_g4Y_40",
    "groupId": "g4Y",
    "name": "يوسف سمير يوسف مجبل",
    "sid": "",
    "note": ""
   }
  ],
  "courses": [
   {
    "id": "c_g1_1",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "مبادئ الموارد المائية (نظري)",
    "nameEn": "Principles of Water Resources (Theory)",
    "lecturer": "م.د. حياة كريم",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_2",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الرياضيات 1",
    "nameEn": "Mathematics I",
    "lecturer": "ا.م.د. نورا جاسم",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_3",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الجيولوجيا الهندسية وفيزياء التربة (نظري)",
    "nameEn": "Engineering Geology & Soil Physics (Theory)",
    "lecturer": "م.د. نور عدنان",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 12:30-2:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_4",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الميكانيك الهندسي 1 (نظري)",
    "nameEn": "Engineering Mechanics I (Theory)",
    "lecturer": "م. علي كفاح",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 8:30-10:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_5",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "اللغة العربية",
    "nameEn": "Arabic Language",
    "lecturer": "م.د. بشير",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 10:30-12:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_6",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الرسم الهندسي (نظري)",
    "nameEn": "Engineering Drawing (Theory)",
    "lecturer": "م.د. تحسين",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 8:30-9:30",
    "room": "المراسم المركزية"
   },
   {
    "id": "c_g1_7",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الرسم الهندسي (عملي)",
    "nameEn": "Engineering Drawing (Practical)",
    "lecturer": "م.د. تحسين + م. هبة كاظم + م. علي كفاح",
    "type": "P",
    "weeklyHours": 4,
    "schedule": "الثلاثاء 10:30-2:30",
    "room": "المراسم المركزية"
   },
   {
    "id": "c_g1_8",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الميكانيك الهندسي 1 (توتوريال)",
    "nameEn": "Engineering Mechanics I (Tutorial)",
    "lecturer": "م. علي كفاح",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 8:30-10:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_9",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الرياضيات 1 (توتوريال)",
    "nameEn": "Mathematics I (Tutorial)",
    "lecturer": "ا.م.د. نورا جاسم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 10:30-12:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_10",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "الجيولوجيا الهندسية وفيزياء التربة (توتوريال)",
    "nameEn": "Engineering Geology & Soil Physics (Tutorial)",
    "lecturer": "م.د. نور عدنان",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 9:30-11:30",
    "room": "ق6"
   },
   {
    "id": "c_g1_11",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g1",
    "nameAr": "مبادئ الموارد المائية (توتوريال)",
    "nameEn": "Principles of Water Resources (Tutorial)",
    "lecturer": "م.د. حياة كريم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 11:30-1:30",
    "room": "ق6"
   },
   {
    "id": "c_g2A_1",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "مقاومة المواد (نظري)",
    "nameEn": "Strength of Materials (Theory)",
    "lecturer": "م.د. عمار عبد الستار",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_2",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "الرياضيات III (نظري)",
    "nameEn": "Mathematics III (Theory)",
    "lecturer": "م.د. داليا عبد المناف",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_3",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "البرمجة الهندسية (عملي)",
    "nameEn": "Engineering Programming (Practical)",
    "lecturer": "م.م. نور صباح + ا.م.د. علي ظافر",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الأحد 12:30-2:30",
    "room": "مختبر الحاسوب"
   },
   {
    "id": "c_g2A_4",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "مواد البناء (نظري)",
    "nameEn": "Building Materials (Theory)",
    "lecturer": "م. لؤي خليل",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 8:30-10:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_5",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "ميكانيك الموائع (نظري)",
    "nameEn": "Fluid Mechanics (Theory)",
    "lecturer": "ا.د. حيدر علي مهدي",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 10:30-12:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_6",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "المساحة الهندسية 1 (نظري)",
    "nameEn": "Engineering Surveying I (Theory)",
    "lecturer": "ا.م.د. علي ظافر",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 12:30-2:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_7",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "الرياضيات III (توتوريال)",
    "nameEn": "Mathematics III (Tutorial)",
    "lecturer": "م.د. داليا عبد المناف",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 8:30-10:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_8",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "البرمجة الهندسية (نظري)",
    "nameEn": "Engineering Programming (Theory)",
    "lecturer": "م.م. نور صباح عبود",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 11:30-12:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g2A_9",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "مواد البناء (عملي)",
    "nameEn": "Building Materials (Practical)",
    "lecturer": "م. لؤي خليل + د. عمار عبد الستار",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 12:30-2:30",
    "room": "مختبر المواد"
   },
   {
    "id": "c_g2A_10",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "ميكانيك الموائع (عملي)",
    "nameEn": "Fluid Mechanics (Practical)",
    "lecturer": "م.م. علي قاسم + م.د. حياة كريم + ا.د. شيماء عبد المطلب",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الأربعاء 8:30-10:30",
    "room": "مختبر الموائع"
   },
   {
    "id": "c_g2A_11",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "مقاومة المواد (توتوريال)",
    "nameEn": "Strength of Materials (Tutorial)",
    "lecturer": "م.د. عمار عبد الستار",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 10:30-12:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_12",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "اللغة العربية II",
    "nameEn": "Arabic Language II",
    "lecturer": "ا.م.د. اخلاص",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأربعاء 12:30-2:30",
    "room": "ق1"
   },
   {
    "id": "c_g2A_13",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "المساحة الهندسية 1 (عملي)",
    "nameEn": "Engineering Surveying I (Practical)",
    "lecturer": "ا.م.د. علي ظافر + م. هبة كاظم",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الخميس 8:30-10:30",
    "room": "مختبر المساحة"
   },
   {
    "id": "c_g2A_14",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g2A",
    "nameAr": "ميكانيك الموائع (توتوريال)",
    "nameEn": "Fluid Mechanics (Tutorial)",
    "lecturer": "م.د. حياة كريم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 10:30-12:30",
    "room": "ق1"
   },
   {
    "id": "c_g3B_1",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "الهيدرولوجيا الهندسية 1 (نظري)",
    "nameEn": "Engineering Hydrology I (Theory)",
    "lecturer": "ا.م.د. هدى طارق",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_2",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "الإنشاءات 1 (نظري)",
    "nameEn": "Structures I (Theory)",
    "lecturer": "م.د. محمد عبد الحسين",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_3",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "تصميم المنشآت الخرسانية (نظري)",
    "nameEn": "Design of Concrete Structures (Theory)",
    "lecturer": "ا. عامر نجم",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 12:30-2:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_4",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "هندسة الري (نظري)",
    "nameEn": "Irrigation Engineering (Theory)",
    "lecturer": "ا.م.د. مي سمير",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 8:30-10:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_5",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "ميكانيك التربة 1 (عملي)",
    "nameEn": "Soil Mechanics I (Practical)",
    "lecturer": "م.د. داليا عبد المناف + م.م. مالك حبيب + ا.د. ختام عبد الحسين",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الاثنين 10:30-12:30",
    "room": "مختبر التربة"
   },
   {
    "id": "c_g3B_6",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "هيدروليك منظومة الأنابيب (نظري)",
    "nameEn": "Pipe System Hydraulics (Theory)",
    "lecturer": "ا.د. عبد الصاحب توفيق",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 12:30-2:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_7",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "الهيدرولوجيا الهندسية 1 (توتوريال)",
    "nameEn": "Engineering Hydrology I (Tutorial)",
    "lecturer": "ا.م.د. هدى طارق",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 8:30-10:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_8",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "ميكانيك التربة (توتوريال)",
    "nameEn": "Soil Mechanics (Tutorial)",
    "lecturer": "ا.د. ختام عبد الحسين",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 10:30-11:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_9",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "هيدروليك منظومة الأنابيب (توتوريال)",
    "nameEn": "Pipe System Hydraulics (Tutorial)",
    "lecturer": "ا.د. عبد الصاحب توفيق",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الأربعاء 8:30-9:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_10",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "هيدروليك منظومة الأنابيب (عملي)",
    "nameEn": "Pipe System Hydraulics (Practical)",
    "lecturer": "ا.م.د. مي سمير + م. محمد عابد + ا.م.د. سعد حسن",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الأربعاء 9:30-11:30",
    "room": "مختبر الموائع"
   },
   {
    "id": "c_g3B_11",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "الإنشاءات 1 (توتوريال)",
    "nameEn": "Structures I (Tutorial)",
    "lecturer": "م.د. محمد عبد الحسين",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 11:30-1:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_12",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "ميكانيك التربة 1 (نظري)",
    "nameEn": "Soil Mechanics I (Theory)",
    "lecturer": "ا.د. ختام عبد الحسين",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الخميس 8:30-10:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_13",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "تصميم المنشآت الخرسانية (توتوريال)",
    "nameEn": "Design of Concrete Structures (Tutorial)",
    "lecturer": "ا. عامر نجم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 10:30-12:30",
    "room": "ق2"
   },
   {
    "id": "c_g3B_14",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g3B",
    "nameAr": "هندسة الري (توتوريال)",
    "nameEn": "Irrigation Engineering (Tutorial)",
    "lecturer": "ا.م.د. مي سمير",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 12:30-2:30",
    "room": "ق2"
   },
   {
    "id": "c_g3Y_1",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "الإنشاءات (نظري)",
    "nameEn": "Structures (Theory)",
    "lecturer": "م.د. محمد عبد الحسين",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_2",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "الهيدرولوجيا الهندسية (نظري)",
    "nameEn": "Engineering Hydrology (Theory)",
    "lecturer": "ا.م.د. هدى طارق",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_3",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "تصميم المنشآت الخرسانية (نظري)",
    "nameEn": "Design of Concrete Structures (Theory)",
    "lecturer": "م.د. تحسين سعد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 12:30-2:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_4",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "هندسة الري والبزل",
    "nameEn": "Irrigation & Drainage Engineering",
    "lecturer": "ا.م.د. سعد حسن",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 8:30-10:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_5",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "القنوات المفتوحة (نظري)",
    "nameEn": "Open Channels (Theory)",
    "lecturer": "ا.د. عبد الصاحب توفيق",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 10:30-12:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_6",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "ميكانيك التربة (عملي)",
    "nameEn": "Soil Mechanics (Practical)",
    "lecturer": "م.د. نور عدنان + ا.م.د. سحر ستار",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الاثنين 12:30-2:30",
    "room": "مختبر التربة"
   },
   {
    "id": "c_g3Y_7",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "تصميم المنشآت الخرسانية (توتوريال)",
    "nameEn": "Design of Concrete Structures (Tutorial)",
    "lecturer": "م.د. تحسين سعد",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 8:30-9:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_8",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "الهيدرولوجيا الهندسية (توتوريال)",
    "nameEn": "Engineering Hydrology (Tutorial)",
    "lecturer": "ا.م.د. هدى طارق",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 9:30-11:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_9",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "تحليلات هندسية (توتوريال)",
    "nameEn": "Engineering Analysis (Tutorial)",
    "lecturer": "ا.م.د. زهير عبد حاجم",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 11:30-12:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_10",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "ميكانيك التربة (توتوريال)",
    "nameEn": "Soil Mechanics (Tutorial)",
    "lecturer": "م.د. نور عدنان",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 12:30-1:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_11",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "هيدروليك منظومة الأنابيب (عملي)",
    "nameEn": "Pipe System Hydraulics (Practical)",
    "lecturer": "م. محمد عابد + م.م. علي قاسم",
    "type": "P",
    "weeklyHours": 1,
    "schedule": "الأربعاء 8:30-9:30",
    "room": "مختبر الموائع"
   },
   {
    "id": "c_g3Y_12",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "هيدروليك منظومة الأنابيب (توتوريال)",
    "nameEn": "Pipe System Hydraulics (Tutorial)",
    "lecturer": "ا.د. عبد الصاحب توفيق",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 9:30-11:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_13",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "تحليلات هندسية (نظري)",
    "nameEn": "Engineering Analysis (Theory)",
    "lecturer": "ا.م.د. زهير عبد حاجم",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأربعاء 11:30-1:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_14",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "اللغة الإنكليزية",
    "nameEn": "English Language",
    "lecturer": "ا.م.د. حيدر عباس",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الأربعاء 1:30-2:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_15",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "ميكانيك التربة 1 (نظري)",
    "nameEn": "Soil Mechanics I (Theory)",
    "lecturer": "ا.م.د. سحر ستار",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الخميس 8:30-10:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_16",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "إدارة الموارد المائية",
    "nameEn": "Water Resources Management",
    "lecturer": "ا.م.د. صباح حسن",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الخميس 10:30-12:30",
    "room": "ق7"
   },
   {
    "id": "c_g3Y_17",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g3Y",
    "nameAr": "الإنشاءات (توتوريال)",
    "nameEn": "Structures (Tutorial)",
    "lecturer": "م.د. محمد عبد الحسين",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 12:30-2:30",
    "room": "ق7"
   },
   {
    "id": "c_g4A_1",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "منشآت هيدروليكية 1 (نظري)",
    "nameEn": "Hydraulic Structures I (Theory)",
    "lecturer": "ا.م.د. رسول مجبل",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_2",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "هندسة الأسس (نظري)",
    "nameEn": "Foundation Engineering (Theory)",
    "lecturer": "ا.م.د. صباح حسن",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_3",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "السدود (توتوريال)",
    "nameEn": "Dams (Tutorial)",
    "lecturer": "م.م. علي قاسم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأحد 12:30-2:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_4",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "تطبيقات الحاسوب في الموارد المائية (نظري)",
    "nameEn": "Computer Applications in Water Resources (Theory)",
    "lecturer": "م. محمد عابد",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الاثنين 8:30-9:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4A_5",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "تطبيقات الحاسوب في الموارد المائية (عملي)",
    "nameEn": "Computer Applications in Water Resources (Practical)",
    "lecturer": "م. محمد عابد + م.م. نور صباح + م.م. مالك حبيب + م.م. هشام سلام",
    "type": "P",
    "weeklyHours": 3,
    "schedule": "الاثنين 9:30-10:30 / الخميس 10:30-12:30",
    "room": "مختبر البرمجة / ق3"
   },
   {
    "id": "c_g4A_6",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "السدود (نظري)",
    "nameEn": "Dams (Theory)",
    "lecturer": "ا.د. صادق سلمان",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 10:30-12:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_7",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "مشروع التخرج",
    "nameEn": "Graduation Project",
    "lecturer": "",
    "type": "X",
    "weeklyHours": 4,
    "schedule": "الثلاثاء 8:30-10:30 / الخميس 12:30-2:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_8",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "تصميم أنظمة شبكات الأنابيب (نظري)",
    "nameEn": "Design of Pipe Network Systems (Theory)",
    "lecturer": "ا.د. كريم رشيد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 10:30-12:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_9",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "منشآت هيدروليكية 1 (توتوريال)",
    "nameEn": "Hydraulic Structures I (Tutorial)",
    "lecturer": "ا.م. علي فرحان",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 8:30-10:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_10",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "هندسة الأسس (تطبيقي)",
    "nameEn": "Foundation Engineering (Applied)",
    "lecturer": "ا.م.د. حيدر عباس + م.م. مالك حبيب",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الأربعاء 10:30-12:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4A_11",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "تصميم أنظمة شبكات الأنابيب (توتوريال)",
    "nameEn": "Design of Pipe Network Systems (Tutorial)",
    "lecturer": "ا.م.د. سعد حسن",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 12:30-2:30",
    "room": "ق3"
   },
   {
    "id": "c_g4A_12",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4A",
    "nameAr": "هندسة الأسس (توتوريال)",
    "nameEn": "Foundation Engineering (Tutorial)",
    "lecturer": "ا.م.د. صباح حسن",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الخميس 8:30-10:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4B_1",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "تصميم أنظمة شبكات الأنابيب (نظري)",
    "nameEn": "Design of Pipe Network Systems (Theory)",
    "lecturer": "ا.د. كريم رشيد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_2",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "هندسة الأسس (نظري)",
    "nameEn": "Foundation Engineering (Theory)",
    "lecturer": "ا.م.د. زهير عبد حاجم",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_3",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "منشآت هيدروليكية 1 (نظري)",
    "nameEn": "Hydraulic Structures I (Theory)",
    "lecturer": "ا.م.د. رسول مجبل",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الأحد 12:30-1:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_4",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "المشروع الهندسي",
    "nameEn": "Engineering Project",
    "lecturer": "",
    "type": "X",
    "weeklyHours": 2,
    "schedule": "الاثنين 8:30-10:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_5",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "تطبيقات الحاسوب في الموارد المائية (نظري)",
    "nameEn": "Computer Applications in Water Resources (Theory)",
    "lecturer": "م. محمد عابد",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الاثنين 10:30-11:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4B_6",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "تطبيقات الحاسوب في الموارد المائية (عملي)",
    "nameEn": "Computer Applications in Water Resources (Practical)",
    "lecturer": "م. محمد عابد + م.م. مالك حبيب + م.م. نور صباح + م.م. هشام سلام",
    "type": "P",
    "weeklyHours": 3,
    "schedule": "الاثنين 11:30-12:30 / الخميس 8:30-10:30",
    "room": "مختبر البرمجة / ق4"
   },
   {
    "id": "c_g4B_7",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "هندسة الأسس (تطبيقي)",
    "nameEn": "Foundation Engineering (Applied)",
    "lecturer": "ا.م.د. حيدر عباس + م.م. مالك حبيب",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الاثنين 12:30-2:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4B_8",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "تصميم أنظمة شبكات الأنابيب (توتوريال)",
    "nameEn": "Design of Pipe Network Systems (Tutorial)",
    "lecturer": "ا.م.د. سعد حسن",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 8:30-10:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_9",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "السدود (توتوريال)",
    "nameEn": "Dams (Tutorial)",
    "lecturer": "م.م. علي قاسم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 10:30-12:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_10",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "هندسة الأسس (توتوريال)",
    "nameEn": "Foundation Engineering (Tutorial)",
    "lecturer": "ا.م.د. زهير عبد حاجم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 12:30-2:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_11",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "منشآت هيدروليكية 1 (توتوريال)",
    "nameEn": "Hydraulic Structures I (Tutorial)",
    "lecturer": "ا.م. علي فرحان",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الأربعاء 10:30-12:30",
    "room": "ق4"
   },
   {
    "id": "c_g4B_12",
    "yearId": "2026-2027",
    "termId": "t1",
    "groupId": "g4B",
    "nameAr": "السدود (نظري)",
    "nameEn": "Dams (Theory)",
    "lecturer": "ا.د. صادق سلمان",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأربعاء 12:30-2:30",
    "room": "ق4"
   },
   {
    "id": "c_g4Y_1",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "هندسة الأسس (نظري)",
    "nameEn": "Foundation Engineering (Theory)",
    "lecturer": "ا.د. فارس وليد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 8:30-10:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_2",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "تصميم أنظمة شبكات الأنابيب (نظري)",
    "nameEn": "Design of Pipe Network Systems (Theory)",
    "lecturer": "ا.د. كريم رشيد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأحد 10:30-12:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_3",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "منشآت هيدروليكية (توتوريال)",
    "nameEn": "Hydraulic Structures (Tutorial)",
    "lecturer": "ا.د. شيماء عبد المطلب",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الأحد 12:30-1:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_4",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "أخلاقيات المهنة",
    "nameEn": "Professional Ethics",
    "lecturer": "م.م. هشام سلام",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الأحد 1:30-2:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_5",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "هندسة الأسس (توتوريال)",
    "nameEn": "Foundation Engineering (Tutorial)",
    "lecturer": "ا.د. فارس وليد",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الاثنين 8:30-9:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_6",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "الري الحقلي (توتوريال)",
    "nameEn": "Field Irrigation (Tutorial)",
    "lecturer": "ا.م.د. سناء عاجل",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الاثنين 9:30-10:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_7",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "اللغة الإنكليزية 4",
    "nameEn": "English Language IV",
    "lecturer": "ا.م.د. حيدر عباس",
    "type": "T",
    "weeklyHours": 1,
    "schedule": "الاثنين 10:30-11:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_8",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "المشروع الهندسي",
    "nameEn": "Engineering Project",
    "lecturer": "",
    "type": "X",
    "weeklyHours": 2,
    "schedule": "الاثنين 11:30-12:30 / الثلاثاء 1:30-2:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_9",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "هندسة السدود (نظري)",
    "nameEn": "Dam Engineering (Theory)",
    "lecturer": "ا.د. صادق سلمان",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الاثنين 12:30-2:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_10",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "هندسة السدود (توتوريال)",
    "nameEn": "Dam Engineering (Tutorial)",
    "lecturer": "م.م. علي قاسم",
    "type": "U",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 8:30-10:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_11",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "أنظمة الري الحقلي (نظري)",
    "nameEn": "Field Irrigation Systems (Theory)",
    "lecturer": "ا.م.د. سناء عاجل",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الثلاثاء 10:30-12:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_12",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "شبكات الأنابيب (توتوريال)",
    "nameEn": "Pipe Networks (Tutorial)",
    "lecturer": "ا.د. كريم رشيد",
    "type": "U",
    "weeklyHours": 1,
    "schedule": "الثلاثاء 12:30-1:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_13",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "نظم المعلومات الجغرافية في الموارد المائية (نظري)",
    "nameEn": "GIS in Water Resources (Theory)",
    "lecturer": "م. محمد عابد",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأربعاء 8:30-10:30",
    "room": "مختبر البرمجة"
   },
   {
    "id": "c_g4Y_14",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "منشآت هيدروليكية (نظري)",
    "nameEn": "Hydraulic Structures (Theory)",
    "lecturer": "ا.د. شيماء عبد المطلب",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الأربعاء 10:30-12:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_15",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "الهندسة الصحية (عملي)",
    "nameEn": "Sanitary Engineering (Practical)",
    "lecturer": "م. لؤي خليل + ا.د. فارس وليد + م.د. هدى عباس",
    "type": "P",
    "weeklyHours": 1,
    "schedule": "الخميس 8:30-9:30",
    "room": "ق5"
   },
   {
    "id": "c_g4Y_16",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "الهندسة الصحية (نظري)",
    "nameEn": "Sanitary Engineering (Theory)",
    "lecturer": "م.د. هدى عباس + م. لؤي خليل",
    "type": "T",
    "weeklyHours": 2,
    "schedule": "الخميس 9:30-11:30",
    "room": "ق5 / مختبر البرمجة"
   },
   {
    "id": "c_g4Y_17",
    "yearId": "2026-2027",
    "termId": "year",
    "groupId": "g4Y",
    "nameAr": "نظم المعلومات الجغرافية في الموارد المائية (عملي)",
    "nameEn": "GIS in Water Resources (Practical)",
    "lecturer": "م.م. نور صباح + ا.د. فارس وليد + ا.م.د. علي ظافر",
    "type": "P",
    "weeklyHours": 2,
    "schedule": "الخميس 12:30-2:30",
    "room": "ق5"
   }
  ]
 }
};
